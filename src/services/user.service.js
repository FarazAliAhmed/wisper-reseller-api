const bcrypt = require("bcrypt");

const { Account } = require("../models/account");

const register = async (requestBody) => {
  let userWithEmail = await Account.findOne({
    email: requestBody.email,
  }).exec();
  let userWithUsername = await Account.findOne({
    username: requestBody.username,
  }).exec();
  if (userWithEmail || userWithUsername)
    return { status: 400, message: "User already registered." };

  let user = new Account(requestBody);
  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(user.password, salt);
  await user.save();

  return { user };
};

const update = async (requestBody, username) => {
  if (requestBody.isAdmin && requestBody.isAdmin == true) return { status: 404, message: "Only Admin can update user access rights" };
  const query = { username };
  let user;
  user = await Account.findOneAndUpdate(
    query,
    { ...requestBody },
    { new: true }
  ).exec();
  if (!user) return { status: 404, message: "User not found." };
  return { user };
};


const addAdmin = async (email) => {
  const query = { email };
  let user;
  user = await Account.findOneAndUpdate(
    query,
    { isAdmin: true },
    { new: true }
  ).exec();
  if (!user) return { status: 404, message: "User not found." };
  return { user, message: "New Admin added successfully" };
}


const removeAdmin = async (email) => {
  const query = { email };
  let user;
  user = await Account.findOneAndUpdate(
    query,
    { isAdmin: false },
    { new: true }
  ).exec();
  if (!user) return { status: 404, message: "User not found." };
  return { user, message: "Admin successfully removed" };
}

module.exports = { register, update, addAdmin, removeAdmin };
