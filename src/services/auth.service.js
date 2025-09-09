const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { Account } = require("../models/account");
const JWT_SECRET = `${process.env.JWT_SECRET}`;
const fs = require("fs");
const path = require("path");
const ejs = require("ejs");
const { transporter } = require("../utils/email/transporter");
const { TermiiService } = require("../services/termii.service");

const auth = async (email, password) => {
  const user = await Account.findOne({ email }).exec();
  if (!user) return { status: 400, message: "Invalid email or password." };

  const checkDate = user.createdAt > new Date("2023-12-01");

  // console.log({ checkDate });

  if (user.createdAt && checkDate && !user.confirmed) {
    return { status: 400, message: "Email not confirmed" };
  }

  if (!user.active) {
    // If the user account is not disabled
    return { status: 400, message: "Account disabled contact admin." };
  }

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

async function sendConfirmationEmail(newUser, tokenCode) {
  try {
    const token = jwt.sign({ userId: newUser._id }, JWT_SECRET, {
      expiresIn: "1hr",
    });

    if (!token) {
      throw new Error("Error generating Token");
    }

    const confirmationLink = `${process.env.WEB_URL}/confirm-email?token=${token}`;
    // const confirmationLink = `http://localhost:7000/confirm-email?token=${token}`;

    const __dirname = process.cwd();
    const emailTemplate = fs.readFileSync(
      path.join(__dirname, "src/emails/ConfirmEmail.ejs"),
      "utf-8"
    );

    const mailOptions = {
      from: "support@wisper.ng",
      to: `${newUser.email}`,
      subject: "Wisper Account Confirmation Email",
      html: ejs.render(emailTemplate, {
        user: newUser,
        // token: confirmationLink,
        token: tokenCode,
      }),
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error("Error sending email:", error);
      } else {
        console.log("Email sent:", info.response);
      }
    });

    try {
      await TermiiService.sendNumberAPI(
        newUser.mobile_number,
        `Hello ${newUser.username}, 
Thank you for registering with WisperNg! To complete your registration, please enter the following code on the platform: ${tokenCode}  

If you didn't request this, please ignore this message.
Best regards,
WisperNg
       `
      );
    } catch (error) {
      console.log(error);
    }

    return confirmationLink;
  } catch (error) {
    console.error("Error sending confirmation email:", error);
  }
}

module.exports = {
  auth,
  whoami,
  updateWhitelist,
  deleteIPAddress,
  changePassword,
  sendConfirmationEmail,
};
