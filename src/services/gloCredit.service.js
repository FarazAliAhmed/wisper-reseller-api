const { Account } = require("../models/account");
const dataBalance = require("../models/dataBalance");
const monnifyHistory = require("../models/monnifyHistory");
const megaPurchaseHistory = require("../models/megaPurchaseHistory");
const transaction = require("../models/transactionHistory");
const postmark = require("postmark");

/**
 * GLO credit facility.
 * Admin credits GB to the account's GLO wallet (mega_wallet.glo, 1000 units = 1GB).
 * GLO orders consume that GB; the user owes (GB used x rate) and repays from the naira wallet.
 * Every repayment gives back the GB it pays for (repaid / rate), so the credit line revolves up to the block (e.g. 10,000GB).
 */
const UNITS_PER_GB = 1000;
// Accounts created before these fields existed have no stored value, so fall back to the defaults
const DEFAULT_RATE = 383;
const DEFAULT_BLOCK_GB = 10000;
const rateOf = (acct) => Number(acct.glo_credit_rate ?? DEFAULT_RATE);
const blockOf = (acct) => Number(acct.glo_credit_block_gb ?? DEFAULT_BLOCK_GB);
const round2 = (n) => Math.round(n * 100) / 100;

const ref = () => `GLOCR${Date.now()}${Math.floor(Math.random() * 1000)}`;

async function getStatus(business_id) {
  const acct = await Account.findById(business_id).lean();
  if (!acct) throw new Error("User not found");
  const bal = await dataBalance.findOne({ business: business_id }).lean();

  const remainingUnits = Number(bal?.mega_wallet?.glo || 0);
  const allocatedUnits = Number(acct.glo_credit_allocated || 0);
  const usedUnits = Math.max(0, allocatedUnits - remainingUnits);
  const rate = rateOf(acct);
  const repaid = Number(acct.glo_credit_repaid || 0);

  return {
    enabled: Boolean(acct.glo_wallet),
    rate,
    block_gb: blockOf(acct),
    allocated_gb: allocatedUnits / UNITS_PER_GB,
    used_gb: usedUnits / UNITS_PER_GB,
    remaining_gb: remainingUnits / UNITS_PER_GB,
    repaid: round2(repaid),
    owed: Math.max(0, round2((usedUnits / UNITS_PER_GB) * rate - repaid)),
    wallet_balance: Number(bal?.wallet_balance || 0),
  };
}

// Add GB to the GLO wallet and the credit allocation
async function creditGB(business_id, gb, channel) {
  const units = Math.round(Number(gb) * UNITS_PER_GB);
  if (!(units > 0)) throw new Error("Enter a valid GB amount");

  const before = await dataBalance.findOne({ business: business_id }).lean();
  if (!before) throw new Error("User data balance not found");

  const updated = await dataBalance.findOneAndUpdate(
    { business: business_id },
    { $inc: { "mega_wallet.glo": units } },
    { new: true }
  );
  const acct = await Account.findByIdAndUpdate(
    business_id,
    { $set: { glo_wallet: true }, $inc: { glo_credit_allocated: units } },
    { new: true }
  );

  await new megaPurchaseHistory({
    business_id,
    username: acct?.username,
    amount: 0,
    volume: Number(gb),
    channel,
    old_bal: Number(before.mega_wallet?.glo || 0),
    new_bal: updated.mega_wallet.glo,
    network: "glo",
    status: "success",
  }).save();

  return updated;
}

// Give back the GB every repayment covers (repaid / rate), so the credit line revolves and never
// exceeds the block. Safe to call repeatedly: only GB not yet given back is credited.
async function restoreRepaidGB(business_id) {
  const acct = await Account.findById(business_id).lean();
  const rate = rateOf(acct);
  if (!acct?.glo_wallet || !(rate > 0)) return 0;

  const restored = Number(acct.glo_credit_restored || 0);
  const due = Math.floor((Number(acct.glo_credit_repaid || 0) / rate) * UNITS_PER_GB) - restored;
  if (!(due > 0)) return 0;

  // Claim first so two repayments at once cannot double-credit
  const claimed = await Account.findOneAndUpdate(
    { _id: business_id, glo_credit_restored: restored ? restored : { $in: [0, null] } },
    { $set: { glo_credit_restored: restored + due } }
  );
  if (!claimed) return 0;

  const gb = due / UNITS_PER_GB;
  await creditGB(business_id, gb, "Repayment - GLO credit restored");
  return gb;
}

// Email the customer when 50%, 80% or 90% of the credit line is used (each level once until repaid)
const ALERT_LEVELS = [90, 80, 50];
async function checkUsageAlert(business_id) {
  const acct = await Account.findById(business_id).select("glo_wallet glo_alert_level glo_credit_block_gb email name").lean();
  if (!acct?.glo_wallet) return;
  const status = await getStatus(business_id);
  const usedPct = 100 * (1 - status.remaining_gb / status.block_gb);
  const level = ALERT_LEVELS.find((l) => usedPct >= l) || 0;
  const last = Number(acct.glo_alert_level || 0);
  if (level === last) return;
  // Without email set up, leave the level unclaimed so the alert still goes out once it is
  if (level > last && !emailConfigured()) return console.log("GLO ALERT EMAIL SKIPPED (email not configured):", acct.email, level);

  const claimed = await Account.findOneAndUpdate(
    { _id: business_id, glo_alert_level: last ? last : { $in: [0, null] } },
    { $set: { glo_alert_level: level } }
  );
  // Only a rise sends an email; a drop (after repayment) just re-arms the alerts
  if (!claimed || level < last) return;

  await sendLowBalanceEmail(acct, status, level);
}

const emailConfigured = () => Boolean(process.env.POSTMARK_API_TOKEN && process.env.ALERT_FROM_EMAIL);

async function sendLowBalanceEmail(acct, status, level) {
  const token = process.env.POSTMARK_API_TOKEN;
  const from = process.env.ALERT_FROM_EMAIL;

  const gb = (n) => `${Number(n).toLocaleString("en-NG", { maximumFractionDigits: 2 })}GB`;
  const naira = (n) => `₦${Number(n).toLocaleString("en-NG", { maximumFractionDigits: 2 })}`;
  try {
    await new postmark.ServerClient(token).sendEmail({
      From: from,
      To: acct.email,
      Subject: `GLO wallet ${level}% used - please repay to avoid interruption`,
      TextBody:
        `Hello ${acct.name || ""},\n\n` +
        `You have used ${level}% of your GLO wallet. Only ${gb(status.remaining_gb)} is left.\n\n` +
        `Outstanding bill: ${naira(status.owed)} (${gb(status.used_gb)} used at ${naira(status.rate)}/GB).\n\n` +
        `Please fund your wallet and click "Repay" on your dashboard. Every repayment adds the same GB back ` +
        `to your GLO wallet instantly, so your service is not interrupted.\n\nXTES`,
    });
    console.log("GLO ALERT EMAIL SENT:", acct.email, level);
  } catch (error) {
    console.log("GLO ALERT EMAIL FAILED:", acct.email, error.message);
  }
}

// Repay the GLO credit from the naira wallet; amount defaults to everything owed
async function repay(business_id, amount) {
  const status = await getStatus(business_id);
  if (!status.enabled) throw new Error("GLO wallet is not active on this account");
  if (!(status.owed > 0)) throw new Error("Nothing to repay");

  const pay = round2(amount === undefined || amount === null || amount === "" ? status.owed : Number(amount));
  if (!(pay > 0)) throw new Error("Enter a valid amount");
  if (pay > status.owed) throw new Error(`You only owe ₦${status.owed}`);

  // Debit only if the wallet can cover it
  const bal = await dataBalance.findOneAndUpdate(
    { business: business_id, wallet_balance: { $gte: pay } },
    { $inc: { wallet_balance: -pay } },
    { new: true }
  );
  if (!bal) throw new Error("Insufficient naira wallet balance");

  const acct = await Account.findByIdAndUpdate(business_id, { $inc: { glo_credit_repaid: pay } }, { new: true });

  await new monnifyHistory({
    business_name: acct.name,
    business_id,
    amount: pay,
    resolvedAmount: pay,
    old_bal: Number(bal.wallet_balance) + pay,
    new_bal: Number(bal.wallet_balance),
    purpose: "GLO Credit Repayment",
    desc: `Repayment of ${pay} NGN for GLO data used on credit.`,
    pay_type: "debit",
    date_of_payment: new Date(),
    payment_ref: ref(),
  }).save();

  const restoredGB = await restoreRepaidGB(business_id);
  checkUsageAlert(business_id).catch((e) => console.log("GLO ALERT ERROR:", e.message));
  return { paid: pay, auto_credited_gb: restoredGB, ...(await getStatus(business_id)) };
}

// Admin overview: every account on the GLO credit facility, with GB used today (Nigeria time)
async function listAll() {
  const accts = await Account.find({ glo_wallet: true }).select("username name email").lean();
  const dayStart = new Date(new Date().toLocaleDateString("en-CA", { timeZone: "Africa/Lagos" }) + "T00:00:00+01:00");

  return Promise.all(
    accts.map(async (acct) => {
      const [status, today] = await Promise.all([
        getStatus(acct._id),
        transaction.aggregate([
          { $match: { business_id: String(acct._id), network_provider: "glo", status: "success", price: 0, createdAt: { $gte: dayStart } } },
          { $group: { _id: null, units: { $sum: { $toDouble: "$data_volume" } }, orders: { $sum: 1 } } },
        ]),
      ]);
      return {
        _id: acct._id,
        username: acct.username,
        name: acct.name,
        email: acct.email,
        ...status,
        used_today_gb: round2((today[0]?.units || 0) / UNITS_PER_GB),
        orders_today: today[0]?.orders || 0,
      };
    })
  );
}

// On startup: give back GB for repayments made before the revolving rule existed
async function restoreAllRepaidGB() {
  const accts = await Account.find({ glo_wallet: true }).select("username").lean();
  for (const acct of accts) {
    const gb = await restoreRepaidGB(acct._id);
    if (gb) console.log(`GLO CREDIT RESTORED: ${acct.username} +${gb}GB`);
  }
}

module.exports = { getStatus, creditGB, repay, restoreRepaidGB, restoreAllRepaidGB, checkUsageAlert, listAll };
