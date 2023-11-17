const dataBalance = require("../models/dataBalance");
const Account = require("../models/account").Account;
const transactionHistory = require("../models/transactionHistory");
const storeFrontHistory = require("../models/storeFrontHistory");

// Function to add a new transaction
async function addAirtimeTransaction(
  transaction_ref,
  business,
  volume,
  price,
  network,
  mobile_number,
  isStoreFront,
  email,
  name
) {
  try {
    const userAccount = await dataBalance.findOne({ business: business });
    const user = await Account.findById(business);

    if (!userAccount) {
      throw new Error("User not found");
    }

    if (!user) {
      throw new Error("User not found");
    }

    // console.log({ userRole: user.type });
    // console.log({ userAccount });

    const old_bal = userAccount.wallet_balance;

    // console.log({ old_bal, price });

    if (Number(old_bal) < Number(price)) {
      throw new Error("Insufficient balance");
    }

    // const new_bal = Number(old_bal) - Number(price);

    let chargedPrice;

    if (user.type == "lite") {
      chargedPrice = Number(price) * 0.985;
    } else {
      chargedPrice = Number(price) * 0.98;
    }

    console.log({ chargedPrice });
    const new_bal = Number(old_bal) - Number(chargedPrice);

    const generatedDesc = generateAirtimeDesc(network, volume, mobile_number);

    const newTransaction = new transactionHistory({
      business_id: business,
      volume,
      phone_number: mobile_number,
      price: chargedPrice,
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

    if (isStoreFront) {
      const sFHist = new storeFrontHistory({
        name: name,
        email: email,
        storeBusiness: business,
        phone: mobile_number,
        profit: 0,
        price: price,
        volume: volume,
        purchase_type: "airtime",
        desc: generatedDesc,
        status: "success",
        network: network,
        transaction_ref: transaction_ref,
      });

      await sFHist.save();
    }

    return newTransaction;
  } catch (error) {
    console.log(error);
    throw new Error(error.message);
  }
}

// Function to update the status of a transaction to Failed (revert)
async function revertTransactionStatus(
  transactionId,
  price,
  isStoreFront,
  email,
  name
) {
  try {
    const updatedTransaction = await transactionHistory.findByIdAndUpdate(
      transactionId,
      { status: "failed" },
      { new: true }
    );

    // console.log({ updatedTransaction });

    if (isStoreFront) {
      const sFHist = new storeFrontHistory({
        name: name,
        email: email,
        storeBusiness: updatedTransaction.business_id,
        phone: updatedTransaction.phone_number,
        profit: 0,
        price: updatedTransaction.price,
        volume: updatedTransaction.volume,
        purchase_type: "airtime",
        desc: updatedTransaction.desc,
        status: "failed",
        network: updatedTransaction.network_provider,
        transaction_ref: updatedTransaction.transaction_ref,
      });

      await sFHist.save();
    }

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
