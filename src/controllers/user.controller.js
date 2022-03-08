const _ = require("lodash");
const { validateUser } = require("../models/account");

const userService = require("../services/user.service");
const { upgradeBalance } = require("../services/balance.service")

const handleRegister = async (req, res) => {
  const { error } = validateUser(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const data = await userService.register(req.body);

  if (data.user) {
    const token = data.user.generateAuthToken();
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
  if(req.body.type && req.body.type === "mega"){
    const business_id = req.user._id
    const balance = await upgradeBalance(business_id)
    if (balance.error) console.log(balance)
  }
  
  const data = await userService.update(req.body, username);

  if (data.user) {
    return res.send(data.user);
  }
  return res.status(data.status).send(data.message);
};

module.exports = { handleRegister, handleUpdate };
