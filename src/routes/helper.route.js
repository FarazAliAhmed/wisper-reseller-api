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

// Check Superjara environment variables
router.get("/check-superjara-env", async (req, res) => {
  const hasToken = !!process.env.SUPERJARA_AUTH_NEW_KEY;
  const tokenLength = process.env.SUPERJARA_AUTH_NEW_KEY?.length || 0;
  const tokenPreview = process.env.SUPERJARA_AUTH_NEW_KEY?.substring(0, 15) || 'NOT SET';
  
  res.json({
    SUPERJARA_AUTH_NEW_KEY_exists: hasToken,
    token_length: tokenLength,
    token_preview: tokenPreview + '...',
    superjara_url: "https://www.superjara.com/api/data/",
    all_superjara_keys: Object.keys(process.env).filter(k => k.includes('SUPERJARA'))
  });
});

// Test Superjara API directly from Railway
router.get("/test-superjara", async (req, res) => {
  const axios = require('axios');
  const token = process.env.SUPERJARA_AUTH_NEW_KEY || 'zXTgJqLSb8wJ0VUpa7iIQpUDWN5MxaF2qruCsHg5Z8XVOcAa1JEVKRQqb8q8ChCs';
  
  try {
    const response = await axios.post(
      "https://www.superjara.com/api/data/",
      {
        product_code: "data_share_1gb",
        phone_number: "08131635113",
        action: "vend",
        user_reference: "railway-test-" + Date.now(),
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Token ${token}`,
          Accept: "application/json",
        },
      }
    );

    res.json({
      success: true,
      message: "Superjara API is working!",
      response: response.data
    });
  } catch (error) {
    res.json({
      success: false,
      status: error?.response?.status,
      error: error?.response?.data,
      message: "Superjara API test failed"
    });
  }
});

module.exports = router;
