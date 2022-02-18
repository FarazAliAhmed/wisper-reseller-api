const bcrypt = require("bcrypt");

const { Account } = require("../models/account");

const register = async (requestBody) => {
  let user = await Account.findOne({ email: requestBody.email }).exec();
  if (user) return { status: 400, message: "User already registered." };

  user = new Account(requestBody);
  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(user.password, salt);
  await user.save();

  return { user };
};

module.exports = { register };
