const dataBalance = require("../models/dataBalance");
const Account = require("../models/account").Account;
const transactionHistory = require("../models/transactionHistory");

// Function to add a new transaction
async function addAirtimeTransaction(
  transaction_ref,
  business,
  volume,
  price,
  network,
  mobile_number
) {
  try {
    const userAccount = await dataBalance.findOne({ business: business });

    if (!userAccount) {
      throw new Error("User not found");
    }

    const old_bal = userAccount.wallet_balance;

    if (Number(old_bal) < Number(price)) {
      throw new Error("Insufficient balance");
    }

    const new_bal = Number(old_bal) - Number(price); // Ensure 'price' is a number

    const generatedDesc = generateAirtimeDesc(network, volume, mobile_number);

    const newTransaction = new transactionHistory({
      business_id: business,
      volume,
      phone_number: mobile_number,
      price,
      old_bal,
      new_bal,
      network_provider: network,
      purchase_type: "airtime",
      desc: generatedDesc,
      status: "success",
      transaction_ref,
    });

    await dataBalance.updateOne({ business }, { wallet_balance: new_bal });

    await newTransaction.save();
    return newTransaction;
  } catch (error) {
    console.log(error);
    throw new Error(error.message);
  }
}

// Function to update the status of a transaction to Failed (revert)
async function revertTransactionStatus(transactionId, price) {
  try {
    const updatedTransaction = await transactionHistory.findByIdAndUpdate(
      transactionId,
      { status: "failed" },
      { new: true }
    );

    // console.log({ updatedTransaction });

    const userAccount = await dataBalance.findOne({
      business: updatedTransaction?.business_id,
    });

    const old_bal = userAccount?.wallet_balance;

    const new_bal = Number(old_bal) + Number(price);
    // console.log({ price, old_bal, new_bal });

    await transactionHistory.findByIdAndUpdate(
      transactionId,
      { old_bal, new_bal },
      { new: true }
    );
    await dataBalance.updateMany(
      { business: updatedTransaction?.business_id },
      { wallet_balance: new_bal }
    );

    return updatedTransaction;
  } catch (error) {
    throw new Error("Error updating transaction status to failed");
  }
}

function generateAirtimeDesc(network, volume, mobile_number) {
  return `Top-up of ₦${volume} airtime on ${network} for ${mobile_number}.`;
}

module.exports = {
  addAirtimeTransaction,
  revertTransactionStatus,
};
