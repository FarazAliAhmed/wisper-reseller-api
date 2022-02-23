const Joi = require("joi");
const jwt = require("jsonwebtoken");
const { Account } = require("../models/account");

const authService = require("../services/auth.service");

const handleLogin = async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const data = await authService.auth(req.body.email, req.body.password);

  if (data.user) {
    const token = data.user.generateAuthToken();
    return res.send(token);
  }
  return res.status(data.status).send(data.message);
};

const whoami = async (req, res) => {
  const token = req.headers["authorization"]?.split(" ")[1];
  if (!token) return null;
  const user = jwt.decode(token);
  if (!user) return null;
  const data = await authService.whoami(user.email);
  return res.send(data?.user);
};

const validate = (requestBody) => {
  const schema = Joi.object({
    email: Joi.string().min(5).max(255).required().email(),
    password: Joi.string().min(5).max(255).required(),
  });

  return schema.validate(requestBody);
};

module.exports = {
  handleLogin,
  whoami,
};
