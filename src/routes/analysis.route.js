const express = require("express");

const getAdmin = require("../utils/middleware/getAdmin");
const getUser = require("../utils/middleware/getUser");
const {
  payment_analysis,
  calWalBal_analysis,
  revenueAnalysis,
  totalCurrentCredit,
  paymentTable,
  walletAnalysis,
  populateBucketUsage,
  getBucketUsage,
  getWalletUsage,
} = require("../controllers/analysis.controller");
const router = express.Router();

// ANALYSIS ROUTE
router.get("/admin/analysis/payment", payment_analysis);
router.get("/admin/analysis/calwalbal", calWalBal_analysis);
router.get("/admin/analysis/revenue", revenueAnalysis);
router.get("/admin/analysis/totalCurrentCredit", totalCurrentCredit);
router.get("/admin/analysis/paymentTable", paymentTable);
router.get("/admin/analysis/walletAnalysis", walletAnalysis);
router.get("/admin/analysis/populateBucketUsage", populateBucketUsage);
router.get("/admin/analysis/getBucketUsage", getAdmin, getBucketUsage);
router.get("/admin/analysis/getBucketUsage", getAdmin, getBucketUsage);
router.get("/admin/analysis/getWalletUsage", getAdmin, getWalletUsage);
// router.get("/admin/analysis/populateWalletUsage", populateWalletUsage);

module.exports = router;
