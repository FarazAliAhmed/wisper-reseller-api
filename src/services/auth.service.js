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

const updateWhitelist = async (email, ipAddr) => {
  const user = await Account.findOne({ email });

  if (!user) {
    throw new Error("User not found");
  }

  if (user.whitelistIP.includes(ipAddr)) {
    return user.whitelistIP;
  }

  user.whitelistIP.push(...ipAddr);

  await user.save();

  return user.whitelistIP;
};

async function deleteIPAddress(email, ipAddress) {
  try {
    // Find the user by email
    const user = await Account.findOne({ email });

    console.log("ipaddres", ipAddress);

    if (!user) {
      throw new Error("User not found"); // Throw an error when the user is not found
    }

    // Remove the specified IP address from the whitelistIP array
    const newWhiteListIP = user.whitelistIP.filter((ip) => ip !== ipAddress);

    // console.log(user.whitelistIP.filter((ip) => ip !== ipAddress));

    // Save the updated user
    user.whitelistIP = newWhiteListIP;

    await user.save();

    return user.whitelistIP;
  } catch (error) {
    throw new Error("Error deleting IP address: " + error.message);
  }
}

async function changePassword(userId, oldPassword, newPassword) {
  // Find the user by ID
  const user = await Account.findById(userId);
  if (!user) {
    throw new Error("User not found");
  }

  // Verify the old password
  const isPasswordValid = await bcrypt.compare(oldPassword, user.password);
  if (!isPasswordValid) {
    throw new Error("Old password is incorrect");
  }

  const salt = await bcrypt.genSalt(10);

  let newHashedPassword = await bcrypt.hash(newPassword, salt);
  await Account.updateOne({ _id: userId }, { password: newHashedPassword });
}

module.exports = {
  auth,
  whoami,
  updateWhitelist,
  deleteIPAddress,
  changePassword,
};
