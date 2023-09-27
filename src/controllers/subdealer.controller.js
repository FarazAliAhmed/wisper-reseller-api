const { Account } = require("../models/account");
const dataBalance = require("../models/dataBalance");
const subdealerHistory = require("../models/subdealerHistory");
const subdealerService = require("../services/subdealer.service");

const createSubdealer = async (req, res) => {
  try {
    const { fullName, email, username, phoneNumber, business } = req.body; // Destructure the request body

    const subdealer = await subdealerService.createSubdealer({
      business,
      fullName,
      email,
      username,
      phoneNumber,
    });

    res
      .status(201)
      .json({ message: "Subdealer created successfully", subdealer });
  } catch (error) {
    console.log(error);
    res.status(400).json({ error: error.message });
  }
};

const getAllSubdealers = async (req, res) => {
  try {
    const { id: businessId } = req.params;

    const subdealers = await subdealerService.getSubdealersByBusiness(
      businessId
    );
    res.json({ subdealers });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const getAllSubdealersTrx = async (req, res) => {
  try {
    const { id: businessId } = req.params;

    const subdealers = await subdealerService.getSubdealersByTrx(businessId);
    res.json({ subdealers });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const getAllSubdealerAdmin = async (req, res) => {
  try {
    const { id: businessId } = req.params;

    const subdealers = await subdealerService.getSubdealersAdmin(businessId);
    res.json({ subdealers });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const getSubdealerInfo = async (req, res) => {
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

const SubdealerGetPurchaseHistory = async (req, res) => {
  try {
    const business_id = req.params.id;
    const { limit } = req.query;

    const limitValue = Number(limit) || 1;

    const purchases = await subdealerHistory
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

const SubdealerGetPurchaseHistoryAdmin = async (req, res) => {
  try {
    const { limit } = req.query;

    const limitValue = Number(limit) || 1;

    const purchases = await subdealerHistory
      .find()
      .sort({ createdAt: -1 })
      .limit(limitValue);
    res.json(purchases);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const SubdealerPurchaseMegaData = async (req, res) => {
  try {
    const { dealer, business_id, network, amountInGB } = req.body;
    const updatedBalance = await subdealerService.purchaseSubdealerMegaData(
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
  createSubdealer,
  getAllSubdealers,
  SubdealerGetPurchaseHistory,
  SubdealerPurchaseMegaData,
  getSubdealerInfo,
  getAllSubdealerAdmin,
  SubdealerGetPurchaseHistoryAdmin,
  getAllSubdealersTrx,
};
