const bcrypt = require("bcrypt");

const { Account } = require("../models/account");

const auth = async (email, password) => {
  const user = await Account.findOne({ email }).exec();
  if (!user) return { status: 400, message: "Invalid email or password." };

  // if (!user.confirmed) {
  //   // If the user hasn't confirmed their email, handle the error
  //   return { status: 400, message: "Email not confirmed." };
  // }


  const validPassword = await bcrypt.compare(password, user.password);
  if (!validPassword) {
    return { status: 400, message: "Invalid email or password." };
  }

  return { user };
};

const whoami = async (email) => {
  const user = await Account.findOne(
    { email },
    { createdAt: 0, updatedAt: 0, __v: 0 }
  ).exec();

  if (!user) return { status: 404, message: "User not found" };
  return { user };
};




module.exports = { auth, whoami };
