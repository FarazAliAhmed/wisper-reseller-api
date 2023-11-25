const apiBalanceModel = require("../../models/apiBalance.model");

const n3tdataApiUpdateBalance = async (response) => {
  await apiBalanceModel.findOneAndUpdate(
    { api: "n3tdata" },
    { $set: { volume: Number(response?.data?.newbal) } }
  );
};

const almamgtApiUpdateBalance = async (bal) => {
  await apiBalanceModel.findOneAndUpdate(
    { api: "almamgt" },
    { $set: { volume: Number(bal) } }
  );
};

module.exports = {
  n3tdataApiUpdateBalance,
  almamgtApiUpdateBalance,
};
