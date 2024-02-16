const Joi = require("joi");
const jwt = require("jsonwebtoken");
const { Account } = require("../models/account");
const bcrypt = require("bcrypt");
var postmark = require("postmark");
const fs = require("fs");
const path = require("path");
const ejs = require("ejs");

const authService = require("../services/auth.service");
const { sendEmail, transporter } = require("../utils/email/transporter");
const { generateRandomPassword } = require("../utils/auth.helper");
const client = new postmark.ServerClient(process.env.POSTMARK);

const handleLogin = async (req, res) => {
  const { error } = validate(req.body);
  // console.log(error)
  if (error) return res.status(400).send(error.details[0].message);

  const { email, password } = req.body;

  const data = await authService.auth(email, password);

  if (data.user) {
    const token = data.user.generateAuthToken();
    return res.send(token);
  }

  return res.status(data.status).send(data.message);
};

const whoami = async (req, res) => {
  const token = req.headers["authorization"]?.split(" ")[1];
  if (!token) return res.status(403).send("No token provided");
  const user = jwt.decode(token);
  if (!user) return res.status(403).send("Invalid token");
  const data = await authService.whoami(user.email);
  return res.send(data?.user);
};

const forgotPassword = async (req, res) => {
  const { email, url } = req.body;
  try {
    const oldUser = await Account.findOne({ email }).exec();
    if (!oldUser) {
      return res.json({ status: "User Does Not Exists!!!" });
    } else {
      const JWT_SECRET = "supersecretxxerex8Qkq1.21SxKj";
      const secret = JWT_SECRET + oldUser.password;
      const token = jwt.sign(
        { email: oldUser.email, id: oldUser._id },
        secret,
        {
          expiresIn: "30m",
        }
      );
      const link = `${url}/reset-password/${oldUser.email}/${token}`;

      await sendEmail(
        email,
        "Reset Password Link",
        `Click on this link to reset your password or copy and paste on your browser if it doesn't work. This link is valid for 30mins ${link}`
      );

      console.log(link);
      return res.json({ status: "User Exists!!", link: link });
    }
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ error: error.message, message: "error occured" });
  }
};

const resetPassword = async (req, res) => {
  const { email, token } = req.params;
  const { password } = req.body;
  const JWT_SECRET = "supersecretxxerex8Qkq1.21SxKj";

  const oldUser = await Account.findOne({ email });
  if (!oldUser) {
    return res.json({ status: "User Not Exists!!" });
  }
  const secret = JWT_SECRET + oldUser.password;
  try {
    const verify = jwt.verify(token, secret);
    const salt = await bcrypt.genSalt(10);
    const encryptedPassword = await bcrypt.hash(password, salt);

    user = await Account.findOneAndUpdate(
      { email },
      { password: encryptedPassword },
      { new: true }
    ).exec();

    console.log("user", user);

    res.send("Password changed");
  } catch (error) {
    console.log(error);
    res.json({ status: "Something Went Wrong" });
  }
};

const confirmEmail = async (req, res) => {
  try {
    // const { token } = req.body;

    // const decodedToken = jwt.verify(token, `${process.env.JWT_SECRET}`);
    // const userId = decodedToken.userId;

    // console.log(decodedToken);

    // const user = await Account.findById(userId);

    // await Account.findOneAndUpdate(
    //   { _id: userId },
    //   { confirmed: true },
    //   { new: true }
    // ).exec();

    const { token, email } = req.body;

    const user = Account.findOne({
      email: email,
      confirmationToken: token,
    }).exec();

    if (!user) {
      return res.status(404).send("Invalid confirmation token");
    }

    await Account.findOneAndUpdate(
      { email: email },
      { confirmed: true, confirmationToken: null },
      { new: true }
    ).exec();

    // await user.save();

    // Redirect the user to a success page or display a success message
    return res.json({ message: "Email confirmed successfully!" });
  } catch (error) {
    // Handle any errors that occur during the confirmation process
    console.error("Confirmation error:", error);
    return res.status(500).json({
      message: error.message || "An error occurred during email confirmation",
    });
  }
};

const resendConfirmEmail = async (req, res) => {
  try {
    const { email } = req.body;

    const __dirname = process.cwd();
    const emailTemplate = fs.readFileSync(
      path.join(__dirname, "src/emails/ConfirmEmail.ejs"),
      "utf-8"
    );

    const token = await generateRandomPassword(5);

    const user = await Account.findOneAndUpdate(
      { email: email },
      { confirmationToken: token },
      { new: true }
    ).exec();

    await authService.sendConfirmationEmail(user, token);

    // const mailOptions = {
    //   from: "support@wisper.ng",
    //   to: `${user.email}`,
    //   subject: "Wisper Account Confirmation Email",
    //   html: ejs.render(emailTemplate, {
    //     user,
    //     // confirmLink: `${process.env.WEB_URL}/confirm-email/${token}`,
    //     token: token,
    //   }),
    // };

    // transporter.sendMail(mailOptions, (error, info) => {
    //   if (error) {
    //     console.error("Error sending email:", error);
    //   } else {
    //     console.log("Email sent:", info.response);
    //   }
    // });
    // Redirect the user to a success page or display a success message
    return res.json({ message: "Confirmation email sent" });
  } catch (error) {
    // Handle any errors that occur during the confirmation process
    console.error("Confirmation error:", error);
    return res
      .status(500)
      .json({ message: "An error occurred during email confirmation" });
  }
};

const ResetActivationLinkEmail = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await Account.findOne({ _id: req.user._id });

    if (!user) {
      res.status(500).json({ message: "no user found" });
    }

    if (user.confirmed) {
      return res.json({ message: "user already confirmed" });
    }

    if (user.email != email) {
      const existingUser = await Account.findOne({ email: email });
      if (existingUser) {
        return res.status(500).json({ message: "Email already in use" });
      }

      await Account.findOneAndUpdate(
        { _id: req.user._id },
        { email: email },
        { new: true }
      ).exec();
    }

    await authService.sendConfirmationEmail(user);

    return res.json({ message: "Confirmation email sent" });
  } catch (error) {
    // Handle any errors that occur during the confirmation process
    console.error("Confirmation error:", error);
    return res
      .status(500)
      .json({ message: "An error occurred during email confirmation" });
  }
};

const updateConfirmedFieldForExistingUsers = async () => {
  try {
    await Account.updateMany({}, { confirmed: true }).exec();
    // console.log('Confirmed field updated for all existing users.');
    res.send("Old users confirmed successfully");
  } catch (error) {
    // console.error('Error updating confirmed field:', error);
    res.send("Error updating confirmed field");
  }
};

const updateWhitelist = async (req, res) => {
  const { error } = addIPAddressesSchema.validate(req.body);

  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }

  try {
    const token = req.headers["authorization"]?.split(" ")[1];
    if (!token) return res.status(403).send("No token provided");
    const user = jwt.decode(token);

    // req body
    const { ipAddress } = req.body;
    const whitelist = await authService.updateWhitelist(user.email, ipAddress);
    // console.log("white list", whitelist);
    return res
      .status(201)
      .json({ message: "IP addresses added successfully", whitelist });
  } catch (error) {
    return res.status(500).json({ message: "Error updating whitelisting" });
  }
};

async function deleteIPAddress(req, res) {
  const { error } = deleteIPAddressesSchema.validate(req.body);

  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }

  const { ipAddress } = req.body;

  try {
    const token = req.headers["authorization"]?.split(" ")[1];
    if (!token) return res.status(403).send("No token provided");
    const user = jwt.decode(token);

    const whitelist = await authService.deleteIPAddress(user.email, ipAddress);

    res
      .status(201)
      .json({ message: "IP address deleted successfully", whitelist });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ error: "Internal server error", msg: error.message });
  }
}

const validate = (requestBody) => {
  const schema = Joi.object({
    email: Joi.string().min(5).max(255).required().email(),
    password: Joi.string().min(5).max(255).required(),
  });

  return schema.validate(requestBody);
};

async function changeUserPassword(req, res) {
  const { oldPassword, newPassword } = req.body;

  try {
    await authService.changePassword(req.user._id, oldPassword, newPassword);
    res.status(200).json({ message: "Password changed successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error.message });
  }
}

const addIPAddressesSchema = Joi.object({
  ipAddress: Joi.array().items(Joi.string().required()),
});

const deleteIPAddressesSchema = Joi.object({
  ipAddress: Joi.string().required(),
});

module.exports = {
  handleLogin,
  whoami,
  forgotPassword,
  resetPassword,
  confirmEmail,
  updateConfirmedFieldForExistingUsers,
  updateWhitelist,
  deleteIPAddress,
  changeUserPassword,
  resendConfirmEmail,
  ResetActivationLinkEmail,
};
