const apiBalanceModel = require("../../models/apiBalance.model");

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
