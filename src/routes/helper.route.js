const express = require("express");

const getAdmin = require("../utils/middleware/getAdmin");
const helperController = require("../controllers/helper.controller");

const router = express.Router();

router.post(
  "/changeToAgent",
  getAdmin,
  helperController.changeSubdealerToAgents
);
router.post(
  "/verifyAllUsers",

  helperController.verifyAllUsersEmail
);
// router.post(
//   "/updateMegaPrice",
//   getAdmin,
//   helperController.updateDefaultMegaPrice
// );
router.post(
  "/filterAndLeaveOneBalanceForAllAccounts",
  getAdmin,
  helperController.filterAndLeaveOneBalanceForAllAccounts
);
router.post(
  "/filterAndLeaveOneZeroAcount",
  getAdmin,
  helperController.filterAndLeaveOneZeroAcount
);

router.post(
  "/calculateTotalVolume",

  helperController.calculateTotalVolume
);

router.delete("/deleteUser", helperController.deleteUserFromWisper);

// Get Railway IP address for Superjara whitelist
router.get("/ip", async (req, res) => {
  try {
    const axios = require('axios');
    const response = await axios.get('https://api.ipify.org?format=json');
    res.json({ 
      ip: response.data.ip,
      message: "Use this IP address to whitelist in Superjara settings"
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to get IP address" });
  }
});

module.exports = router;
