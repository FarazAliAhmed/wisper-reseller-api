const express = require("express");
const router = express.Router();
const { getUser, getAdmin, parseKey } = require("../utils").middleware;

const { handleLogin, whoami } = require("../controllers/auth.controller");
const {
  handleRegister,
  handleUpdate,
} = require("../controllers/user.controller");

const {
  getAccountBalance,
  getAllBusinessBalances,
  creditBalance,
  updateAllBalance,
} = require("../controllers/balance.controller");
const {
  getTransaction,
  getAllTransaction,
  getAllBusinessTransactions,
} = require("../controllers/transaction.controller");
const {
  getPayment,
  getAllPayments,
  getAllBusinessPayments,
  postPayment,
  updatePayment,
  deletePayment,
} = require("../controllers/payment.controller");

const { getPlans } = require("../controllers/plans.controller");
const sendData = require("../controllers/sendData.controller");

router.get("/whoami", whoami);
router.post("/auth", handleLogin);
router.post("/users", handleRegister);
router.patch("/users/:username", getUser, handleUpdate);
//handleUpdate route should be protected

// Dashboard Routes
// Routes Called by businesses
router.get("/plans", getUser, getPlans);

router.get("/balance", getUser, getAccountBalance);

router.get("/transaction/:id", getUser, getTransaction);
router.get("/transactions", getUser, getAllTransaction);

router.get("/payment/:id", getUser, getPayment);
router.get("/payments", getUser, getAllPayments);


/**Routes Called by Admin
 * remember to set auth tokens to expire
 */
router.get("/admin/balances", getAdmin, getAllBusinessBalances);
router.get("/admin/transactions", getAdmin, getAllBusinessTransactions);

router.post("/admin/credit", getAdmin, creditBalance);

router.get("/admin/payments", getAdmin, getAllBusinessPayments);
router.post("/admin/payments", getAdmin, postPayment);
router.patch("/admin/payments/:id", getAdmin, updatePayment);
router.delete("/admin/payments/:id", getAdmin, deletePayment);
router.post("/admin/balance/upgrade", getAdmin, updateAllBalance);
// Endpoint for admin to upgrade user from lite to mega
// Define a get all accounts route for admin
// Define endpoint for admin to debit a user's account

/**END USER ROUTES
 */
router.post("/buy", parseKey, sendData);

module.exports = router;
