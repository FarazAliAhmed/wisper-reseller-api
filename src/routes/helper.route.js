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

router.delete(
  "/deleteUser",

  helperController.deleteUserFromWisper
);

module.exports = router;
