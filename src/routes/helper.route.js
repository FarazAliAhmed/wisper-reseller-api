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
  
  const testResults = {
    token_exists: !!process.env.SUPERJARA_AUTH_NEW_KEY,
    using_hardcoded: !process.env.SUPERJARA_AUTH_NEW_KEY,
    tests: []
  };

  // Test 1: New URL with Token auth
  try {
    const response = await axios.post(
      "https://www.superjara.com/api/data/",
      {
        product_code: "data_share_1gb",
        phone_number: "08131635113",
        action: "vend",
        user_reference: "test-new-" + Date.now(),
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Token ${token}`,
          Accept: "application/json",
        },
      }
    );

    testResults.tests.push({
      name: "New URL with Token auth",
      url: "https://www.superjara.com/api/data/",
      success: true,
      response: response.data
    });
  } catch (error) {
    testResults.tests.push({
      name: "New URL with Token auth",
      url: "https://www.superjara.com/api/data/",
      success: false,
      status: error?.response?.status,
      error: error?.response?.data
    });
  }

  // Test 1b: New URL with Bearer auth
  try {
    const response = await axios.post(
      "https://www.superjara.com/api/data/",
      {
        product_code: "data_share_1gb",
        phone_number: "08131635113",
        action: "vend",
        user_reference: "test-bearer-" + Date.now(),
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      }
    );

    testResults.tests.push({
      name: "New URL with Bearer auth",
      url: "https://www.superjara.com/api/data/",
      success: true,
      response: response.data
    });
  } catch (error) {
    testResults.tests.push({
      name: "New URL with Bearer auth",
      url: "https://www.superjara.com/api/data/",
      success: false,
      status: error?.response?.status,
      error: error?.response?.data
    });
  }

  // Test 1c: New URL with api_key in body
  try {
    const response = await axios.post(
      "https://www.superjara.com/api/data/",
      {
        product_code: "data_share_1gb",
        phone_number: "08131635113",
        action: "vend",
        user_reference: "test-apikey-" + Date.now(),
        api_key: token
      },
      {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      }
    );

    testResults.tests.push({
      name: "New URL with api_key in body",
      url: "https://www.superjara.com/api/data/",
      success: true,
      response: response.data
    });
  } catch (error) {
    testResults.tests.push({
      name: "New URL with api_key in body",
      url: "https://www.superjara.com/api/data/",
      success: false,
      status: error?.response?.status,
      error: error?.response?.data
    });
  }

  // Test 2: Old URL with Token auth
  try {
    const response = await axios.post(
      "https://superjara.com/autobiz_vending_index.php",
      {
        product_code: "data_share_1gb",
        phone_number: "08131635113",
        action: "vend",
        user_reference: "test-old-" + Date.now(),
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Token ${token}`,
          Accept: "application/json",
        },
      }
    );

    testResults.tests.push({
      name: "Old URL with Token auth",
      url: "https://superjara.com/autobiz_vending_index.php",
      success: true,
      response: response.data
    });
  } catch (error) {
    testResults.tests.push({
      name: "Old URL with Token auth",
      url: "https://superjara.com/autobiz_vending_index.php",
      success: false,
      status: error?.response?.status,
      error: error?.response?.data
    });
  }

  res.json(testResults);
});

module.exports = router;
