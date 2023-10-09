const _ = require("lodash");
const { validateUser, Account } = require("../models/account");

const userService = require("../services/user.service");
const { upgradeBalance } = require("../services/balance.service");
const Joi = require("joi");
const monnifyService = require("../services/monnify.service");

const handleRegister = async (req, res) => {
  const { error } = validateUser(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const data = await userService.register(req.body);

  console.log(data.user);

  if (data.user) {
    const token = data.user.generateAuthToken();

    await monnifyService.createAccount(
      data.user._id,
      data.user.name,
      data.user.email,
      data.user.name
    );

    return res
      .header("x-auth-token", token)
      .header("access-control-expose-headers", "x-auth-token")
      .send(_.pick(data.user, ["_id", "name", "email"]));
  }
  return res.status(data.status).send(data.message);
};

const handleUpdate = async (req, res) => {
  const { username } = req.params;
  const { error } = validateUser(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  // Update the user balance unit if user type is updated to "mega"
  if (req.body.type && req.body.type === "mega") {
    const business_id = req.user._id;
    const balance = await upgradeBalance(business_id);
    if (balance.error) console.log(balance);
  }

  const data = await userService.update(req.body, username);

  if (data.user) {
    return res.json(
      _.omit(data.user._doc, ["password", "access_token", "isAdmin"])
    );
  }
  return res.status(data.status).send(data.message);
};

const createAdmin = async (req, res) => {
  const { email } = req.body;
  if (!email)
    return res.status(400).json({
      status: "failed",
      message: "You must provide the email of account to be upgraded",
    });
  const createResponse = await userService.addAdmin(email);
  if (!createResponse.user)
    return res
      .status(400)
      .json({ status: "failed", message: createResponse.message });
  return res.status(201).json(createResponse);
};

const deleteAdmin = async (req, res) => {
  const { email } = req.params;
  if (!email)
    return res.status(400).json({
      status: "failed",
      message: "You must provide the email of account to be upgraded",
    });
  const createResponse = await userService.removeAdmin(email);
  if (!createResponse.user)
    return res
      .status(400)
      .json({ status: "failed", message: createResponse.message });
  return res.status(201).json(createResponse);
};

const addWebhook = async (req, res) => {
  const { url } = req.body;
  const { username } = req.user;

  const { error } = validateAddUrl(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const data = await userService.saveWebhook(username, url);

  if (data.user) {
    return res.json(
      _.omit(data.user._doc, ["password", "access_token", "isAdmin"])
    );
  }
  return res.status(data.status).send(data.message);
};

const addCallback = async (req, res) => {
  const { url } = req.body;
  const { username } = req.user;

  const { error } = validateAddUrl(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const data = await userService.saveCallback(username, url);

  if (data.user) {
    return res.json(
      _.omit(data.user._doc, "password", "access_token", "isAdmin")
    );
  }
  return res.status(data.status).send(data.message);
};

const validateAddUrl = (fields) => {
  const schema = Joi.object({
    url: Joi.string().required(),
  });

  return schema.validate(fields);
};

const uuid = require("uuid");

async function changeAccessToken(req, res) {
  const accountId = req.params.id; // Assuming you're passing the account ID in the route params
  const newAccessToken = uuid.v4(); // Generate a new unique access token

  try {
    // Check if the new access token is already in use
    const tokenInUse = await Account.findOne({ access_token: newAccessToken });

    if (tokenInUse) {
      return res
        .status(400)
        .json({ message: "New access token is not unique." });
    }

    // Update the account's access_token using updateOne
    await Account.updateOne(
      { _id: accountId },
      { $set: { access_token: newAccessToken } }
    );

    return res
      .status(200)
      .json({ message: "Access token updated successfully.", newAccessToken });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error." });
  }
}

module.exports = {
  handleRegister,
  handleUpdate,
  createAdmin,
  deleteAdmin,
  addCallback,
  addWebhook,
  changeAccessToken,
};
