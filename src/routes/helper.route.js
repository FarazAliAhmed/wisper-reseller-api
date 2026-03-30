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
    superjara_url: "https://superjara.com/autobiz_vending_index.php",
    all_superjara_keys: Object.keys(process.env).filter(k => k.includes('SUPERJARA'))
  });
});

// Test Superjara API directly from Railway
router.get("/test-superjara", async (req, res) => {
  const axios = require('axios');
  const token = process.env.SUPERJARA_AUTH_NEW_KEY;
  
  if (!token) {
    return res.json({
      error: "SUPERJARA_AUTH_NEW_KEY not set in environment variables"
    });
  }

  const testResults = {
    token_preview: token.substring(0, 15) + '...',
    endpoint: "https://superjara.com/autobiz_vending_index.php",
    test: {}
  };

  // Test with Bearer header (as per Superjara's PHP example)
  try {
    const response = await axios.post(
      "https://superjara.com/autobiz_vending_index.php",
      {
        product_code: "mtn_sme_1gb",
        phone_number: "08131635113",
        action: "vend",
        user_reference: "test-" + Date.now(),
      },
      {
        headers: {
          "Content-Type": "application/json",
          "Bearer": token,
          Accept: "application/json",
        },
      }
    );

    testResults.test = {
      success: true,
      response: response.data
    };
  } catch (error) {
    testResults.test = {
      success: false,
      status: error?.response?.status,
      error: error?.response?.data || error.message
    };
  }

  res.json(testResults);
});

module.exports = router;
