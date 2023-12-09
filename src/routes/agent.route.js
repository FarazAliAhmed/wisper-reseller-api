const express = require("express");
const {
  DealerGetHistory,
  getAgentInfo,
  getAllAgents,
  AgentGetPurchaseHistory,
  AgentGetPurchaseHistoryAdmin,
  getAllAgentAdmin,
  getAllAgentsTrx,
  AgentPurchaseMegaData,
  createAgentController,
  disableAgentAccount,
} = require("../controllers/agent.controller");
const getUser = require("../utils/middleware/getUser");
const getAdmin = require("../utils/middleware/getAdmin");
const { enableAgentAccount } = require("../services/agent.service");

const router = express.Router();

router.get("/getAgentsInfo/:id", getUser, getAgentInfo);

router.post("/disbaleAgentAccount", getUser, disableAgentAccount);

router.put("/enableAgentAccount", getUser, enableAgentAccount);

router.post("/createAgent", createAgentController);

router.get("/getAllAgentsId/:id", getUser, getAllAgents);

router.get("/getAgentHistory/:id", getUser, AgentGetPurchaseHistory);

router.get("/DealerGetHistory/:id", getUser, DealerGetHistory);

router.post("/allocateData", getUser, AgentPurchaseMegaData);

router.get("/allTrx/:id", getUser, getAllAgentsTrx);

// admin
router.get("/getAgentsAdmin", getAdmin, getAllAgentAdmin);
router.get("/getAgentHistoryAdmin", getAdmin, AgentGetPurchaseHistoryAdmin);

module.exports = router;
