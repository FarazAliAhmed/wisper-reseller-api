const bcrypt = require("bcrypt");

const { Account } = require("../models/account");
const monnifyService = require("./monnify.service");
const { storeFrontUserPlanSingle } = require("./storeFront.service");

const register = async (requestBody) => {
  try {
    let userWithEmail = await Account.findOne({
      email: requestBody.email,
    }).exec();
    let userWithUsername = await Account.findOne({
      username: requestBody.username,
    }).exec();
    if (userWithEmail)
      return { status: 400, message: "User with email already registered." };
    if (userWithUsername)
      return { status: 400, message: "User with username already registered." };

    let user = new Account(requestBody);
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(user.password, salt);

    await user.save();

    await monnifyService.createAccount(
      user._id,
      user.name,
      user.email,
      user.name
    );

    await storeFrontUserPlanSingle(user._id);

    return { user };
  } catch (error) {
    // console.log(error);
    throw error;
  }
};

const update = async (requestBody, username) => {
  if (requestBody.isAdmin && requestBody.isAdmin == true)
    return { status: 404, message: "Only Admin can update user access rights" };
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
};

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
};

const saveCallback = async (username, callback_url) => {
  let user;
  user = await Account.findOneAndUpdate(
    { username },
    { callback: callback_url },
    { new: true }
  ).exec();

  if (!user)
    return { status: 404, message: "Error occured while updating callback." };
  return { user };
};

const saveWebhook = async (username, webhook_url) => {
  let user;
  user = await Account.findOneAndUpdate(
    { username },
    { webhook: webhook_url },
    { new: true }
  ).exec();

  if (!user)
    return {
      status: 404,
      message: "Error occured while updating webhook url.",
    };
  return { user };
};

module.exports = {
  register,
  update,
  addAdmin,
  removeAdmin,
  saveCallback,
  saveWebhook,
};

// const register = async (requestBody) => {
//   let userWithEmail = await Account.findOne({
//     email: requestBody.email,
//   }).exec();
//   let userWithUsername = await Account.findOne({
//     username: requestBody.username,
//   }).exec();
//   if (userWithEmail || userWithUsername)
//     return { status: 400, message: "User already registered." };

//   let user = new Account(requestBody);

//   user.confirmed = false;

//   const salt = await bcrypt.genSalt(10);
//   user.password = await bcrypt.hash(user.password, salt);

//   const confirmationToken = uuid.v4();
//   user.confirmationToken = confirmationToken;

//   await user.save();

//   const confirmationLink = `${requestBody.url}/confirm-email/${confirmationToken}`;

//   client.sendEmail({
//     "From": "admin@wisper.ng",
//     "To": requestBody.email,
//     "Subject": "Confirm Email",
//     TextBody: `Dear User,\n\nPlease click the link below to confirm your email address:\n\n${confirmationLink}\n\nThank you.`,
//    });

//   return { user };
// };
