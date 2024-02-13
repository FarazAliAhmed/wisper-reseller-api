/* eslint-disable no-useless-catch */
const bcrypt = require("bcrypt");

const { Account } = require("../models/account");
const monnifyService = require("./monnify.service");
const { storeFrontUserPlanSingle } = require("./storeFront.service");
const storeFront = require("../models/storeFront");
const { toMapPlans } = require("../utils/sFHelper");
const { transporter } = require("../utils/email/transporter");
const fs = require("fs");
const path = require("path");
const ejs = require("ejs");
const userPlan = require("../models/userPlan");
const { generateRandomPassword } = require("../utils/auth.helper");
const { sendConfirmationEmail } = require("./auth.service");
const uuid = require("uuid");
const megaPrice = require("../models/megaPrice");
const { TermiiService } = require("../services/termii.service");

const register = async (requestBody) => {
  console.log({ requestBody });
  try {
    let userWithEmail = await Account.findOne({
      email: requestBody.email,
    }).exec();

    let userWithUsername = await Account.findOne({
      username: requestBody.username,
    }).exec();

    if (userWithEmail) {
      throw new Error("email already exists");
    }

    if (userWithUsername) {
      throw new Error("user with username already exists");
    }
    const accessToken = await generateUniqueAccessToken();

    // Include the unique access token in the user object
    const user = new Account({
      ...requestBody,
      access_token: accessToken,
    });

    await user.save();

    const salt = await bcrypt.genSalt(10);
    // user.password = await bcrypt.hash(user.password, salt);
    const newUserpassword = await bcrypt.hash(user.password, salt);

    await Account.findOneAndUpdate(
      { _id: user._id },
      { password: newUserpassword },
      { new: true }
    ).exec();

    await monnifyService.createAccount(
      user._id,
      user.name,
      user.email,
      user.name
    );

    await storeFrontUserPlanSingle(user._id);

    const new_storeFront = new storeFront({
      business_id: user._id,
      storeName: user.name,
      storeUserName: user.username,
    });

    // Save the store front to the database
    await new_storeFront.save();

    // create user plans
    for (let j = 0; j < toMapPlans.length; j++) {
      try {
        const newPlan = new userPlan({
          business: user._id,
          plan_id: toMapPlans[j].plan_id,
          network: toMapPlans[j].network,
          plan_type: "gifting",
          price: toMapPlans[j].price,
          volume: toMapPlans[j].volume,
          unit: toMapPlans[j].unit,
          validity: "30 days",
        });
        await newPlan.save();
      } catch (error) {
        console.log(error);
        console.log("failed to create plan for", user.name);
      }
    }

    const __dirname = process.cwd();
    const emailTemplate = fs.readFileSync(
      path.join(__dirname, "src/emails/ConfirmEmail.ejs"),
      "utf-8"
    );

    const token = await generateRandomPassword(6);

    await Account.findOneAndUpdate(
      { _id: user._id },
      { confirmationToken: token },
      { new: true }
    ).exec();

    const sentLink = await sendConfirmationEmail(user);

    console.log({ sentLink });

    try {
      await TermiiService.sendNumberAPI(
        user.mobile_number,
        `Hello ${user.username},

      Thank you for registering with WisperNg! To confirm your email address and complete your registration, please click on the following link: ${sentLink}
      
      If you didn't request this, please ignore this message.
      
      Best regards,
      WisperNg
      `
      );
    } catch (error) {
      console.log(error);
    }

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

const generateUniqueAccessToken = async () => {
  let uniqueToken = uuid.v4();

  // Check if the token already exists in the database
  while (await Account.findOne({ access_token: uniqueToken })) {
    // If it exists, generate a new one
    uniqueToken = uuid.v4();
  }

  return uniqueToken;
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
