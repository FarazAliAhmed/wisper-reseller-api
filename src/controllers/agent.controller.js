const { Account } = require("../models/account");
const dataBalance = require("../models/dataBalance");
const agentHistory = require("../models/agentHistory");
const agentService = require("../services/agent.service");

const createAgent = async (req, res) => {
  try {
    const { fullName, email, username, phoneNumber, business } = req.body; // Destructure the request body

    console.log("AGENT", "create agent");

    const subdealer = await agentService.createAgent({
      business,
      fullName,
      email,
      username,
      phoneNumber,
      fullName,
    });

    res
      .status(201)
      .json({ message: "Subdealer created successfully", subdealer });
  } catch (error) {
    console.log(error);
    res.status(400).json({ error: error.message });
  }
};

const getAllAgents = async (req, res) => {
  try {
    const { id: businessId } = req.params;

    const subdealers = await agentService.getAgentsByBusiness(businessId);
    res.json({ subdealers });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const getAllAgentsTrx = async (req, res) => {
  try {
    const { id: businessId } = req.params;

    const subdealers = await agentService.getAgentsByTrx(businessId);
    res.json({ subdealers });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const getAllAgentAdmin = async (req, res) => {
  try {
    const { id: businessId } = req.params;

    const subdealers = await agentService.getAgentsAdmin(businessId);
    res.json({ subdealers });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const getAgentInfo = async (req, res) => {
  try {
    const { id: businessId } = req.params;

    const subdealers = await Account.findOne({ _id: businessId });

    const databal = await dataBalance.findOne({ business: businessId });

    res.json({ subdealers, dataBalance: databal });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const DealerGetHistory = async (req, res) => {
  try {
    const business_id = req.params.id;
    const { limit } = req.query;

    const limitValue = Number(limit) || 1;

    const purchases = await agentHistory
      .find({
        dealer: business_id,
      })
      .sort({ createdAt: -1 })
      .limit(limitValue);
    res.json(purchases);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
const AgentGetPurchaseHistory = async (req, res) => {
  try {
    const business_id = req.params.id;
    const { limit } = req.query;

    const limitValue = Number(limit) || 1;

    const purchases = await agentHistory
      .find({
        business_id: business_id,
      })
      .sort({ createdAt: -1 })
      .limit(limitValue);
    res.json(purchases);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const AgentGetPurchaseHistoryAdmin = async (req, res) => {
  try {
    const { limit } = req.query;

    const limitValue = Number(limit) || 1;

    const purchases = await agentHistory
      .find()
      .sort({ createdAt: -1 })
      .limit(limitValue);
    res.json(purchases);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const AgentPurchaseMegaData = async (req, res) => {
  try {
    const { dealer, business_id, network, amountInGB } = req.body;
    const updatedBalance = await agentService.purchaseAgentMegaData(
      dealer,
      business_id,
      network,
      amountInGB
    );
    res.json(updatedBalance);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: error.message });
  }
};

module.exports = {
  createAgent,
  getAllAgents,
  AgentGetPurchaseHistory,
  AgentPurchaseMegaData,
  getAgentInfo,
  getAllAgentAdmin,
  AgentGetPurchaseHistoryAdmin,
  getAllAgentsTrx,
  DealerGetHistory,
};
