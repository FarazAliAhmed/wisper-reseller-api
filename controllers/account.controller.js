const { login } = require("../services/account.service");

const handleLogin = (req, res) => {
  login();
};

module.exports = {
  handleLogin,
};
