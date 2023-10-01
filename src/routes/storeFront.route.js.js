const express = require("express");

const getAdmin = require("../utils/middleware/getAdmin");
const {
  createStoreFront,
  getStoreFrontByBusinessId,
  getAllStoreFronts,
  updateStoreFront,
} = require("../controllers/storeFront.controller");
const getUser = require("../utils/middleware/getUser");
const router = express.Router();

router.post("/api/store-fronts", getUser, createStoreFront);
router.get(
  "/api/store-fronts/:business_id",
  getUser,
  getStoreFrontByBusinessId
);
router.get("/api/store-fronts", getAdmin, getAllStoreFronts);
router.put("/api/store-fronts/:business_id", getUser, updateStoreFront);

module.exports = router;
