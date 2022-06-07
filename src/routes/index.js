const express = require("express");
const router = express.Router();
const { getUser, getAdmin, parseKey, transactionOnAllocate } = require("../utils").middleware;

const { handleLogin, whoami } = require("../controllers/auth.controller");
const {
  handleRegister,
  handleUpdate,
  createAdmin,
  deleteAdmin,
} = require("../controllers/user.controller");

const {
  getAllBusiness,
  getOneBusiness,
  getSystemAdmins
} = require('../controllers/business.controller')

const {
  getAccountBalance,
  getAllBusinessBalances,
  creditBalance,
  debitBalance,
  updateAllBalance,
  getApiBalance
} = require("../controllers/balance.controller");
const {
  postTransaction,
  getTransaction,
  getAllTransaction,
  getAllBusinessTransactions,
  updateTransaction,
  deleteTransaction,
} = require("../controllers/transaction.controller");
const {
  getPayment,
  getAllPayments,
  getAllBusinessPayments,
  postPayment,
  updatePayment,
  deletePayment,
} = require("../controllers/payment.controller");

const {
  getOnePlan,
  getAllPlans,
  createOnePlan,
  updateOnePlan,
  deleteOnePlan,
  deleteNetworkPlans,
  deleteAllPlans,
} = require("../controllers/plans.controller");

const { getNetworks } = require("../controllers/networks.controller")

const sendData = require("../controllers/sendData.controller");

const {
  createMaintenance,
  getMaintenance,
  enterMaintenance,
  exitMaintenance,
} = require('../controllers/maintenance.controller')

router.get("/maintenance", getMaintenance)
router.get("/whoami", whoami);
router.post("/auth", handleLogin);
router.post("/users", handleRegister);
router.patch("/users/:username", getUser, handleUpdate);
//handleUpdate route should be protected

// Dashboard Routes
// Routes Called by businesses
router.get("/plans", getUser, getAllPlans);
router.get("/networks", getUser, getNetworks);

router.get("/balance", getUser, getAccountBalance);

router.get("/transaction/:id", getUser, getTransaction);
router.get("/transactions", getUser, getAllTransaction);

router.get("/payment/:id", getUser, getPayment);
router.get("/payments", getUser, getAllPayments);


/**Routes Called by Admin
 * remember to set auth tokens to expire
 */
router.get("/admin/business", getAdmin, getAllBusiness);
router.get("/admin/business/get/:account_id", getOneBusiness);
router.get("/admin/admins", getAdmin, getSystemAdmins);

router.get("/admin/balances", getAdmin, getAllBusinessBalances);

router.post("/admin/credit", getAdmin, creditBalance);
router.post("/admin/debit", getAdmin, debitBalance);

router.get("/admin/transactions", getAdmin, getAllBusinessTransactions);
router.post("/admin/transactions", getAdmin, postTransaction);
router.patch("/admin/transactions/:id", getAdmin, updateTransaction);
router.delete("/admin/transactions/:id", getAdmin, deleteTransaction);

router.get("/admin/payments", getAdmin, getAllBusinessPayments);
router.post("/admin/payments", getAdmin, postPayment);
router.patch("/admin/payments/:id", getAdmin, updatePayment);
router.delete("/admin/payments/:id", getAdmin, deletePayment);

router.get("/admin/plans", getAdmin, getAllPlans)
router.get("/admin/plans/:plan_id", getAdmin, getOnePlan)
router.post("/admin/plans/create", getAdmin, createOnePlan)
router.delete("/admin/plans/delete", getAdmin, deleteAllPlans)
router.patch("/admin/plans/:plan_id", getAdmin, updateOnePlan)
router.delete("/admin/plans/:plan_id", getAdmin, deleteOnePlan)
router.delete("/admin/plans/network/:network", getAdmin, deleteNetworkPlans)

router.post("/admin/admin/create", getAdmin, createAdmin)
router.delete("/admin/admin/remove", getAdmin, deleteAdmin)

router.get("/admin/api/balance", getAdmin, getApiBalance)

router.post("/admin/maintenance/create", getAdmin, createMaintenance)
router.patch("/admin/maintenance/enter/:network", getAdmin, enterMaintenance)
router.patch("/admin/maintenance/exit/:network", getAdmin, exitMaintenance)

// router.post("/admin/balance/upgrade", getAdmin, updateAllBalance);
// Endpoint for admin to upgrade user from lite to mega

/**END USER ROUTES
 */
router.post("/buy", parseKey, sendData);

module.exports = router;
