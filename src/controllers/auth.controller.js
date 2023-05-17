const Joi = require("joi");
const jwt = require("jsonwebtoken");
const { Account } = require("../models/account");
const bcrypt = require("bcrypt");
var postmark = require("postmark");

const authService = require("../services/auth.service");
const client = new postmark.ServerClient(process.env.POSTMARK);

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
  if (!token) return res.status(403).send("No token provided");
  const user = jwt.decode(token);
  if (!user) return res.status(403).send("Invalid token");
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


const forgotPassword =  async (req, res) => {
  const { email } = req.body;
  try {
    const oldUser = await Account.findOne({ email }).exec();
    if (!oldUser) {
      return res.json({ status: "User Does Not Exists!!" });
    } else {
      const JWT_SECRET = "supersecretxxerex8Qkq1.21SxKj"
      const secret = JWT_SECRET + oldUser.password;
      const token = jwt.sign({ email: oldUser.email, id: oldUser._id }, secret, {
        expiresIn: "30m",
      });
      const link = `http://localhost:5000/api/reset_password/${oldUser.email}/${token}`;

      client.sendEmail({
        "From": "admin@wisper.ng",
        "To": email,
        "Subject": "Reset Password Link",
        "TextBody": `Click on this link to reset your password or copy and paste on your browser if it doesn't work. This link is valid for 30mins ${link}`
      });
    
      console.log(link);
      return res.json({ status: "User Exists!!", link:link });
    }
   
  } catch (error) { }
};


const resetPassword =  async (req, res) => {
  const { email, token } = req.params;
  const { password } = req.body;
  const JWT_SECRET = "supersecretxxerex8Qkq1.21SxKj"

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
      {email},
      { password: encryptedPassword },
      { new: true }
    ).exec();


    console.log("user", user)

    res.send("Password changed");
  } catch (error) {
    console.log(error);
    res.json({ status: "Something Went Wrong" });
  }
};


module.exports = {
  handleLogin,
  whoami,
  forgotPassword,
  resetPassword
};
