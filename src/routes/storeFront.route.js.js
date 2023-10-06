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
  getAllStoreFrontHistory,
  getAllStoreFrontHistoryBusiness,
} = require("../controllers/storeFront.controller");
const getUser = require("../utils/middleware/getUser");
const SFSendData = require("../controllers/SFSendData.controller");
const parseKey = require("../utils/middleware/parseKey");
const router = express.Router();

// jdjd

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

router.post("/store-fronts/allocateData", parseKey, SFSendData);

// store front history
router.get(
  "/store-fronts-history/:business_id",
  getUser,
  getAllStoreFrontHistoryBusiness
);
router.get("/store-fronts-all-history", getAdmin, getAllStoreFrontHistory);

module.exports = router;
