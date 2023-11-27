const apiBalanceModel = require("../../models/apiBalance.model");

const n3tdataApiUpdateBalance = async (response) => {
  try {
    await apiBalanceModel.findOneAndUpdate(
      { api: "n3tdata" },
      { $set: { volume: Number(response?.data?.newbal) } }
    );
  } catch (error) {
    console.log(error);
    console.log("error updating n3tdata balance");
  }
};

const almamgtApiUpdateBalance = async (bal) => {
  try {
    await apiBalanceModel.findOneAndUpdate(
      { api: "almamgt" },
      { $set: { volume: Number(bal) } }
    );
  } catch (error) {
    console.log(error);
    console.log("error updating almamgt balance");
  }
};

module.exports = {
  n3tdataApiUpdateBalance,
  almamgtApiUpdateBalance,
};
