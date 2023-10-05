const express = require("express");

const getAdmin = require("../utils/middleware/getAdmin");
const {
  createStoreFront,
  getStoreFrontByBusinessId,
  getAllStoreFronts,
  updateStoreFront,
  getStoreFrontByUserName,
  checkStoreFrontUserName,
  checkPhoneStoreFronts,
} = require("../controllers/storeFront.controller");
const getUser = require("../utils/middleware/getUser");
const SFSendData = require("../controllers/SFSendData.controller");
const parseKey = require("../utils/middleware/parseKey");
const router = express.Router();

router.post("/create-all-store-fronts", getAdmin, createStoreFront);
router.get("/check-store-username/:username", getUser, checkStoreFrontUserName);
router.get("/store-fronts/:business_id", getUser, getStoreFrontByBusinessId);
router.get(
  "/store-fronts-username/:username",
  getUser,
  getStoreFrontByUserName
);
router.get("/store-fronts-phone/:phone", checkPhoneStoreFronts);
router.get("/store-fronts", getAdmin, getAllStoreFronts);
router.put("/store-fronts/:business_id", getUser, updateStoreFront);

router.post("/allocateData", parseKey, SFSendData);

module.exports = router;
