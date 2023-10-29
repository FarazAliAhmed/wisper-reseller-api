const express = require("express");
const router = express.Router();

const parseKey = require("../utils/middleware/parseKey");
const {
  purchaseAirtime,
} = require("../controllers/purchaseAirtime.controller");

router.post("/buyAirtime", parseKey, purchaseAirtime);
router.post("/buyAirtimeSF", purchaseAirtime);

module.exports = router;
