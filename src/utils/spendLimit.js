const { Account } = require("../models/account");

/**
 * Reserve `amount` against the account's spend limit before charging the wallet.
 * Accounts without a limit (spend_limit = null) are never blocked.
 * Returns { error, reserved } — call releaseSpend with the same amount if the purchase fails.
 */
async function reserveSpend(accountId, amount) {
  const amt = Number(amount) || 0;
  const account = await Account.findById(accountId).select("spend_limit").lean();
  if (!account || account.spend_limit === null || account.spend_limit === undefined) {
    return { error: false, reserved: false };
  }

  // Atomic check-and-add so parallel orders cannot overshoot the limit
  const updated = await Account.findOneAndUpdate(
    {
      _id: accountId,
      spend_limit: { $ne: null },
      $expr: {
        $lte: [{ $add: [{ $ifNull: ["$spend_used", 0] }, amt] }, "$spend_limit"],
      },
    },
    { $inc: { spend_used: amt } },
    { new: true }
  );

  if (!updated) {
    return {
      error: true,
      status: 400,
      message: "Spending limit reached. Please contact support.",
    };
  }
  return { error: false, reserved: true };
}

async function releaseSpend(accountId, amount) {
  const amt = Number(amount) || 0;
  await Account.updateOne(
    { _id: accountId, spend_limit: { $ne: null } },
    { $inc: { spend_used: -amt } }
  );
}

module.exports = { reserveSpend, releaseSpend };
