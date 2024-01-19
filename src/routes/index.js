const express = require("express");
const router = express.Router();
const { getUser, getAdmin, parseKey, transactionOnAllocate } =
  require("../utils").middleware;

const {
  handleLogin,
  whoami,
  forgotPassword,
  resetPassword,
  updateConfirmedFieldForExistingUsers,
  updateWhitelist,
  deleteIPAddress,
  changeUserPassword,
} = require("../controllers/auth.controller");
const {
  handleRegister,
  handleUpdate,
  createAdmin,
  deleteAdmin,
  addWebhook,
  addCallback,
  changeAccessToken,
} = require("../controllers/user.controller");

const {
  getAllBusiness,
  getOneBusiness,
  getSystemAdmins,
  enableBusinessAccount,
  disableBusinessAccount,
  setBusinessAccountType,
} = require("../controllers/business.controller");

const {
  getAccountBalance,
  getWalletBalance,
  getAllBusinessBalances,
  creditBalance,
  debitBalance,
  updateAllBalance,
  getApiBalance,
} = require("../controllers/balance.controller");
const {
  postTransaction,
  getTransaction,
  getAllTransaction,
  getAllBusinessTransactions,
  updateTransaction,
  deleteTransaction,
  totalTrxSingle,
  totalTrxAll,
  totalDataSoldSingle,
  totalDataSoldAll,
} = require("../controllers/transaction.controller");
const {
  getPayment,
  getAllPayments,
  getAllBusinessPayments,
  postPayment,
  updatePayment,
  deletePayment,
  updatePaymentType,
} = require("../controllers/payment.controller");

const {
  getOnePlan,
  getAllPlans,
  createOnePlan,
  updateOnePlan,
  deleteOnePlan,
  deleteNetworkPlans,
  deleteAllPlans,
  getPlansByUserId,
  createPlanUser,
  updatePlanUser,
  deletePlanUser,
  updateSellingPlan,
} = require("../controllers/plans.controller");

const { getNetworks } = require("../controllers/networks.controller");

const sendData = require("../controllers/sendData.controller");

const {
  createMaintenance,
  getMaintenance,
  enterMaintenance,
  exitMaintenance,
  setNoticeMessag,
  clearNoticeMessag,
} = require("../controllers/maintenance.controller");

const {
  getBucketID,
  updateBucketID,
  bucketIDOne,
  bucketIDSwitchOne,
} = require("../controllers/bucketID.controller");
const checkWhitelistIP = require("../utils/middleware/checkWhitelistIP");

router.post("/reset_password/:email/:token", resetPassword);
router.post("/forgot_password", forgotPassword);
router.post("/change_password", getUser, changeUserPassword);

router.get("/maintenance", getMaintenance);
router.get("/whoami", whoami);
router.post("/auth", handleLogin);
router.post("/users", handleRegister);
router.post("/updateConfirm", updateConfirmedFieldForExistingUsers);
router.post("/updateWhitelist", updateWhitelist);
router.post("/deleteIPAddress", deleteIPAddress);
router.get("/changeAccessToken/:id", changeAccessToken);

//handleUpdate route should be protected
router.patch("/users/:username", getUser, handleUpdate);

// Dashboard Routes
// Routes Called by businesses
router.get("/plans", getAllPlans);
router.get("/networks", getUser, getNetworks);

router.get("/balance", getUser, getAccountBalance);
router.get("/wallet", getUser, getWalletBalance);

router.get("/transaction/:id", getUser, getTransaction);
router.get("/transactions", getUser, getAllTransaction);

// Route for get data info start
router.get("/trxSingle/:id", totalTrxSingle);
router.get("/totalDataSingle/:id", totalDataSoldSingle);

// Route for get data info end

router.get("/payment/:id", getUser, getPayment);
router.get("/payments", getUser, getAllPayments);

router.post("/url/webhook", getUser, addWebhook);
router.post("/url/callback", getUser, addCallback);

// GET plans  NEWWW
router.get("/plans_user/:userId", getPlansByUserId);

/**Routes Called by Admin
 * remember to set auth tokens to expire
 */
router.get("/admin/business", getAdmin, getAllBusiness);
router.get("/admin/business/get/:account_id", getOneBusiness);
router.get("/admin/admins", getAdmin, getSystemAdmins);

router.get("/admin/balances", getAdmin, getAllBusinessBalances);

// router.post("/admin/credit", getAdmin, creditBalance);
// router.post("/admin/debit", getAdmin, debitBalance);

router.get("/admin/transactions", getAdmin, getAllBusinessTransactions);

// route for trx info start
router.get("/admin/trxAll", getAdmin, totalTrxAll);
router.get("/admin/totalDataAll", getAdmin, totalDataSoldAll);
// route for trx info end

router.post("/admin/transactions", getAdmin, postTransaction);
router.patch("/admin/transactions/:id", getAdmin, updateTransaction);
router.delete("/admin/transactions/:id", getAdmin, deleteTransaction);

router.post("/admin/update_payment_type", getAdmin, updatePaymentType);
router.get("/admin/payments", getAdmin, getAllBusinessPayments);
router.post("/admin/payments", getAdmin, postPayment);
router.patch("/admin/payments/:id", getAdmin, updatePayment);
router.delete("/admin/payments/:id", getAdmin, deletePayment);

// previous
router.get("/admin/plans", getAdmin, getAllPlans);
router.get("/admin/plans/:plan_id", getAdmin, getOnePlan);
router.post("/admin/plans/create", getAdmin, createOnePlan);
router.delete("/admin/plans/delete", getAdmin, deleteAllPlans);
router.patch("/admin/plans/:plan_id", getAdmin, updateOnePlan);
router.delete("/admin/plans/:plan_id", getAdmin, deleteOnePlan);
router.delete("/admin/plans/network/:network", getAdmin, deleteNetworkPlans);

// BUCKET ID ROUTE
router.get("/admin/getBucket", getBucketID);
router.post("/admin/updateBucket", updateBucketID);
router.post("/admin/getBucketOne", bucketIDOne);
router.post("/admin/bucketIDSwitchOne", bucketIDSwitchOne);

// PLANS ROUTE
router.get("/admin/plans_user/:userId", getUser, getPlansByUserId);
router.post("/admin/plans_user/:userId", getAdmin, createPlanUser);
router.put("/admin/plans_user/:userId/:planId", getAdmin, updatePlanUser);
router.post("/admin/update_selling/:userId", getUser, updateSellingPlan);
router.delete("/admin/plans_user/:userId/:planId", getAdmin, deletePlanUser);

router.post("/admin/admin/create", getAdmin, createAdmin);
router.delete("/admin/admin/remove/:email", getAdmin, deleteAdmin);

router.get("/admin/api/balance", getAdmin, getApiBalance);

router.post("/admin/maintenance/create", getAdmin, createMaintenance);
router.patch("/admin/maintenance/enter/:network", getAdmin, enterMaintenance);
router.patch("/admin/maintenance/exit/:network", getAdmin, exitMaintenance);
router.post("/admin/maintenance/notice", getAdmin, setNoticeMessag);
router.get("/admin/maintenance/clear", getAdmin, clearNoticeMessag);

router.get(
  "/admin/account/enable/:account_id",
  getAdmin,
  enableBusinessAccount
);
router.get(
  "/admin/account/disable/:account_id",
  getAdmin,
  disableBusinessAccount
);
router.post("/admin/account/type", setBusinessAccountType);

// upgrade user from lite to mega and back to lite

// router.post("/admin/balance/upgrade", getAdmin, updateAllBalance);
// Endpoint for admin to upgrade user from lite to mega

/**END USER ROUTES
 */
router.post("/buy", parseKey, sendData);

module.exports = router;
