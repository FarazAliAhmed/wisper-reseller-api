const { Account } = require("../models/account");
const dataBalance = require("../models/dataBalance");
const monnifyHistory = require("../models/monnifyHistory");
const megaPurchaseHistory = require("../models/megaPurchaseHistory");

/**
 * GLO credit facility.
 * Admin credits GB to the account's GLO wallet (mega_wallet.glo, 1000 units = 1GB).
 * GLO orders consume that GB; the user owes (GB used x rate) and repays from the naira wallet.
 * Each time repayments cover another full block (e.g. 10,000GB), another block is credited automatically.
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

// Credit another block for every full block covered by repayments (safe to call repeatedly)
async function applyAutoCredit(business_id) {
  const acct = await Account.findById(business_id).lean();
  const blockValue = blockOf(acct) * rateOf(acct);
  if (!(blockValue > 0)) return 0;

  const earned = Math.floor(Number(acct.glo_credit_repaid || 0) / blockValue);
  const given = Number(acct.glo_credit_auto_blocks || 0);
  if (earned <= given) return 0;

  // Claim the new blocks first so two repayments at once cannot double-credit
  const claimed = await Account.findOneAndUpdate(
    { _id: business_id, glo_credit_auto_blocks: given },
    { $set: { glo_credit_auto_blocks: earned } }
  );
  if (!claimed) return 0;

  const gb = (earned - given) * blockOf(acct);
  await creditGB(business_id, gb, "Auto credit - GLO repayment");
  return gb;
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

  const autoCreditedGB = await applyAutoCredit(business_id);
  return { paid: pay, auto_credited_gb: autoCreditedGB, ...(await getStatus(business_id)) };
}

module.exports = { getStatus, creditGB, repay, applyAutoCredit };
