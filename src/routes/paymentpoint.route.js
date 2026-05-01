const express = require("express");
const router = express.Router();
const paymentpointService = require("../services/paymentpoint.service");
const { authenticate, authorizeAdmin } = require("../middleware/auth");

/**
 * @route   POST /api/paymentpoint/create-account
 * @desc    Create a virtual account for a user
 * @access  Private
 */
router.post("/create-account", authenticate, async (req, res) => {
  try {
    const { accountName, bvn, nin } = req.body;
    const user = req.user;

    if (!accountName) {
      return res.status(400).json({
        success: false,
        message: "Account name is required",
      });
    }

    const result = await paymentpointService.createVirtualAccount({
      accountReference: user._id.toString(),
      accountName: accountName,
      customerEmail: user.email,
      customerName: user.name || user.username,
      bvn: bvn,
      nin: nin,
    });

    res.status(200).json(result);
  } catch (error) {
    console.error("Create PaymentPoint account error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to create virtual account",
    });
  }
});

/**
 * @route   GET /api/paymentpoint/account-details
 * @desc    Get user's PaymentPoint account details
 * @access  Private
 */
router.get("/account-details", authenticate, async (req, res) => {
  try {
    const user = req.user;
    const accountReference = user._id.toString();

    const accountDetails = await paymentpointService.getAccountDetails(accountReference);

    if (!accountDetails) {
      return res.status(404).json({
        success: false,
        message: "No PaymentPoint account found. Please create one first.",
      });
    }

    res.status(200).json({
      success: true,
      data: accountDetails,
    });
  } catch (error) {
    console.error("Get account details error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch account details",
    });
  }
});

/**
 * @route   POST /api/paymentpoint/webhook
 * @desc    Handle PaymentPoint webhook notifications
 * @access  Public (but should verify signature)
 */
router.post("/webhook", async (req, res) => {
  try {
    const webhookData = req.body;
    const signature = req.headers["x-paymentpoint-signature"] || req.headers["x-signature"];

    // Verify webhook signature if provided
    if (signature) {
      const isValid = paymentpointService.verifyWebhookSignature(webhookData, signature);
      if (!isValid) {
        console.error("Invalid webhook signature");
        return res.status(401).json({
          success: false,
          message: "Invalid webhook signature",
        });
      }
    }

    const result = await paymentpointService.processWebhook(webhookData);

    res.status(200).json(result);
  } catch (error) {
    console.error("PaymentPoint webhook error:", error);
    
    // Still return 200 to prevent webhook retries for known errors
    res.status(200).json({
      success: false,
      message: error.message,
    });
  }
});

/**
 * @route   GET /api/paymentpoint/history
 * @desc    Get user's PaymentPoint transaction history
 * @access  Private
 */
router.get("/history", authenticate, async (req, res) => {
  try {
    const user = req.user;
    const limit = parseInt(req.query.limit) || 50;

    const result = await paymentpointService.getTransactionHistory(
      user._id.toString(),
      limit
    );

    res.status(200).json(result);
  } catch (error) {
    console.error("Get transaction history error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch transaction history",
    });
  }
});

/**
 * @route   POST /api/paymentpoint/admin/credit
 * @desc    Admin: Manually credit user wallet
 * @access  Admin only
 */
router.post("/admin/credit", authenticate, authorizeAdmin, async (req, res) => {
  try {
    const { business_id, amount, reason } = req.body;

    if (!business_id || !amount) {
      return res.status(400).json({
        success: false,
        message: "business_id and amount are required",
      });
    }

    if (amount <= 0) {
      return res.status(400).json({
        success: false,
        message: "Amount must be greater than 0",
      });
    }

    const result = await paymentpointService.adminCreditWallet({
      business_id,
      amount,
      reason: reason || "Admin Credit",
    });

    res.status(200).json(result);
  } catch (error) {
    console.error("Admin credit wallet error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to credit wallet",
    });
  }
});

/**
 * @route   POST /api/paymentpoint/admin/debit
 * @desc    Admin: Manually debit user wallet
 * @access  Admin only
 */
router.post("/admin/debit", authenticate, authorizeAdmin, async (req, res) => {
  try {
    const { business_id, amount, reason } = req.body;

    if (!business_id || !amount) {
      return res.status(400).json({
        success: false,
        message: "business_id and amount are required",
      });
    }

    if (amount <= 0) {
      return res.status(400).json({
        success: false,
        message: "Amount must be greater than 0",
      });
    }

    const result = await paymentpointService.adminDebitWallet({
      business_id,
      amount,
      reason: reason || "Admin Debit",
    });

    res.status(200).json(result);
  } catch (error) {
    console.error("Admin debit wallet error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to debit wallet",
    });
  }
});

/**
 * @route   GET /api/paymentpoint/admin/history/:userId
 * @desc    Admin: Get user's transaction history
 * @access  Admin only
 */
router.get("/admin/history/:userId", authenticate, authorizeAdmin, async (req, res) => {
  try {
    const { userId } = req.params;
    const limit = parseInt(req.query.limit) || 100;

    const result = await paymentpointService.getTransactionHistory(userId, limit);

    res.status(200).json(result);
  } catch (error) {
    console.error("Admin get transaction history error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch transaction history",
    });
  }
});

module.exports = router;
