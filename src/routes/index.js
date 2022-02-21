const express = require("express");
const router = express.Router();
const { getUser, getAdmin, parseKey } = require("../utils").middleware;

const { handleLogin, whoami } = require("../controllers/auth.controller");
const handleRegister = require("../controllers/user.controller");

const {
  getAccountBalance,
  getAllBusinessBalances,
  creditBalance,
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
} = require("../controllers/payment.controller");

const { getPlans } = require("../controllers/plans.controller");
const sendData = require("../controllers/sendData.controller");

router.get("/whoami", whoami);
router.post("/auth", handleLogin);
router.post("/users", handleRegister);

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
router.get("/admin/payments", getAdmin, getAllBusinessPayments);
router.post("/admin/credit", getAdmin, creditBalance);

/**END USER ROUTES
 */
router.post("/buy", parseKey, sendData);

module.exports = router;
