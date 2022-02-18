const DataBalance = require("../models/dataBalance");

const create = async (id) => {
  const businessId = id;
  const balance = new DataBalance({ business: id }); // save the business id to the field that references the business Model
  const savedBalance = await balance.save();
  if (savedBalance)
    return {
      status: 201,
      message: "Empty Data balance for business successfully created",
    };
  return { status: 500, message: "Error creating wallet for business" };
};

const update = async (id) => {
  const businessId = id;
  // find balance with the particular business id

  // update and return new value as response
};

const reset = async (id) => {
  const businessId = id;
  const balance = Balance.findOneAndUpdate(
    { business: id },
    { data_volume: 0 }
  ).exec();
  if (balance) return { balance };
  return {
    status: 400,
    message: `Error reseting data balance of business with id: ${id}`,
  };
};

module.exports = {
  create,
  update,
  reset,
};
