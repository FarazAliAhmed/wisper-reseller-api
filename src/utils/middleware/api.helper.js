const apiBalanceModel = require("../../models/apiBalance.model");
const { TermiiService } = require("../../services/termii.service");

const n3tdataApiUpdateBalance = async (response) => {
  try {
    await apiBalanceModel.findOneAndUpdate(
      { api: "n3tdata" },
      { $set: { volume: Number(response?.data?.newbal) } }
    );
    return;
  } catch (error) {
    console.log(error);
    console.log("error updating n3tdata balance");
    return;
  }
};

const ayinlakApiUpdateBalance = async (response) => {
  if (Number(response?.data?.balance_after) < 20000) {
    // send to num
    await TermiiService.sendNumberAPI(
      "08103312533",
      `Ayinlak Balance is low current balance is ${Number(
        response?.data?.balance_after
      )} naira
     `
    );
    // send to ebuka num
    await TermiiService.sendNumberAPI(
      "07064982500",
      `Ayinlak Balance is low current balance is ${Number(
        response?.data?.balance_after
      )} naira
     `
    );

    // // send to abigail num
    // await TermiiService.sendNumberAPI(
    //   "08168229309",
    //   `Ayinlak Balance is low current balance is ${Number(
    //     response?.data?.balance_after
    //   )} naira
    //  `
    // );
    // // send to chisom num
    // await TermiiService.sendNumberAPI(
    //   "09057790907",
    //   `Ayinlak Balance is low current balance is ${Number(
    //     response?.data?.balance_after
    //   )} naira
    //  `
    // );
  }

  try {
    await apiBalanceModel.findOneAndUpdate(
      { api: "ayinlak" },
      { $set: { volume: Number(response?.data?.balance_after) } }
    );
    return;
  } catch (error) {
    console.log(error);
    console.log("error updating n3tdata balance");
    return;
  }
};

const almamgtApiUpdateBalance = async (bal) => {
  try {
    await apiBalanceModel.findOneAndUpdate(
      { api: "almamgt" },
      { $set: { volume: Number(bal) } }
    );
    return;
  } catch (error) {
    console.log(error);
    console.log("error updating almamgt balance");
    return;
  }
};

module.exports = {
  n3tdataApiUpdateBalance,
  almamgtApiUpdateBalance,
  ayinlakApiUpdateBalance,
};
