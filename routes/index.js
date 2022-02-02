const router = require("express").Router();
const { handleLogin } = require("../controllers/account.controller");

router.post("/auth", handleLogin);

module.exports = router;
