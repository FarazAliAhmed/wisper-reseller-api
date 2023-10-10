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
  uploadImageStoreFronts,
  storeAnalysis,
} = require("../controllers/storeFront.controller");
const getUser = require("../utils/middleware/getUser");
const SFSendData = require("../controllers/SFSendData.controller");
const router = express.Router();

const multer = require("multer");
const uuidv4 = require("uuid/v4");

// const upload = multer({ dest: "uploads/" });

const DIR = "uploads/";

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, DIR); // Specify your destination directory here
  },
  filename: (req, file, cb) => {
    const fileName = file.originalname.toLowerCase();
    const fileExtension = fileName.split(".").pop(); // Get the file extension
    const uniqueFileName = uuidv4() + "." + fileExtension; // Add a unique identifier and the original extension
    cb(null, uniqueFileName);
  },
});

const upload = multer({
  storage: storage, // Use the updated storage configuration
  fileFilter: (req, file, cb) => {
    if (
      file.mimetype === "image/png" ||
      file.mimetype === "image/jpg" ||
      file.mimetype === "image/jpeg"
    ) {
      cb(null, true);
    } else {
      cb(null, false);
      cb(new Error("Only .png, .jpg, and .jpeg format allowed!"));
    }
  },
});

router.post("/create-all-store-fronts", getAdmin, createStoreFront);
router.get("/check-store-username/:username", checkStoreFrontUserName);
router.get("/store-fronts/:business_id", getStoreFrontByBusinessId);
router.get("/store-fronts-username/:username", getStoreFrontByUserName);
router.get("/store-fronts-phone/:phone", checkPhoneStoreFronts);
router.get("/store-fronts", getAdmin, getAllStoreFronts);
router.put("/store-fronts/:business_id", getUser, updateStoreFront);
router.post("/store-fronts/allocateData", SFSendData);
router.get("/store-fronts-all-history", getAdmin, getAllStoreFrontHistory);
// analysis
router.get(
  "/store-fronts/analysis/:business",

  storeAnalysis
);

router.get(
  "/store-fronts-history/:business_id",
  getAllStoreFrontHistoryBusiness
);

router.post(
  "/store-fronts-upload",
  upload.single("profileImg"),
  uploadImageStoreFronts
);

module.exports = router;
