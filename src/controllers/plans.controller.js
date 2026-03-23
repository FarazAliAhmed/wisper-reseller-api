const _ = require("lodash");
const Joi = require("joi");
const {
  getOne,
  getAll,
  createOne,
  updateOne,
  deleteOne,
  deleteNetwork,
  deleteAll,
} = require("../services/plan.service");

const { loadPlans } = require("../scripts/loader");
const { Account } = require("../models/account");
const plan = require("../models/plan");
const userPlan = require("../models/userPlan");

const defaultPlans = require("../utils/plans.json");

const getAllPlans = async (req, res) => {
  const { plan, message, error } = await getAll();
  if (error) return res.status(400).json({ message, status: "failed" });
  return res.status(200).json({
    plan: _.map(
      plan,
      _.partialRight(_.pick, [
        "plan_id",
        "network",
        "plan_type",
        "volume",
        "price",
        "unit",
        "validity",
        "size",
        "id",
      ])
    ),
    message,
    status: "success",
  });
  // "price",
};

// const getAllPlans = async (req, res) => {
//   const { plan, message, error } = await getAll();
//   if (error) return res.status(400).json({ message, status: "failed" });
//   return res.status(200).json(defaultPlans);
//   // "price",
// };

const getOnePlan = async (req, res) => {
  const { plan_id } = req.params;
  const planResponse = await getOne(plan_id);
  if (planResponse.error)
    return res
      .status(400)
      .json({ ..._.omit(planResponse, ["error"]), status: "failed" });
  return res.status(200).json({ ...planResponse, status: "success" });
};

const createOnePlan = async (req, res) => {
  const fields = req.body;
  const { error } = validateCreate(fields);
  if (error)
    return res
      .status(400)
      .json({ status: "failed", message: error.details[0].message });
  const planResponse = await createOne(fields);
  if (planResponse.error)
    return res
      .status(400)
      .json({ ..._.omit(planResponse, ["error"]), status: "failed" });
  await loadPlans();
  return res.status(200).json({ ...planResponse, status: "success" });
};

const updateOnePlan = async (req, res) => {
  const { plan_id } = req.params;
  const fields = req.body;
  const { error } = validateUpdate(fields);
  if (error)
    return res
      .status(400)
      .json({ status: "failed", message: error.details[0].message });
  const planResponse = await updateOne(plan_id, fields);
  if (planResponse.error)
    return res
      .status(400)
      .json({ ..._.omit(planResponse, ["error"]), status: "failed" });
  await loadPlans();
  return res.status(200).json({ ...planResponse, status: "success" });
};

const deleteOnePlan = async (req, res) => {
  const { plan_id } = req.params;
  const planResponse = await deleteOne(plan_id);
  if (planResponse.error)
    return res
      .status(400)
      .json({ ..._.omit(planResponse, ["error"]), status: "failed" });
  await loadPlans();
  return res.status(200).json({ ...planResponse, status: "success" });
};

const deleteNetworkPlans = async (req, res) => {
  const { network } = req.params;
  const planResponse = await deleteNetwork(network);
  if (planResponse.error)
    return res
      .status(400)
      .json({ ..._.omit(planResponse, ["error"]), status: "failed" });
  await loadPlans();
  return res.status(200).json({ ...planResponse, status: "success" });
};

const deleteAllPlans = async (req, res) => {
  const planResponse = await deleteAll();
  if (planResponse.error)
    return res
      .status(400)
      .json({ ..._.omit(planResponse, ["error"]), status: "failed" });
  await loadPlans();
  return res.status(200).json({ ...planResponse, status: "success" });
};

// user plans new

// Get plans by user ID
const getPlansByUserId = async (req, res) => {
  try {
    const user = await userPlan
      .find({ business: req.params.userId })
      .sort({ createdAt: -1 });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(user);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal Server Error", msg: error });
  }
};

const createPlanUser = async (req, res) => {
  try {
    const user = await Account.findById(req.params.userId);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const newPlan = new userPlan({
      plan_id: Number(req.body.plan_id),
      business: req.params.userId,
      network: req.body.network,
      plan_type: req.body.plan_type,
      price: Number(req.body.price),
      volume: Number(req.body.volume),
      unit: req.body.unit,
      validity: req.body.validity,
    });

    await newPlan.save();

    res.status(201).json(newPlan);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal Server Error", msg: error });
  }
};

const updatePlanUser = async (req, res) => {
  try {
    const bodyObj = req.body;

    console.log({ business: req.params.userId, plan_id: req.params.planId });

    console.log(bodyObj);
    const planToUpdate = await userPlan.findOneAndUpdate(
      {
        business: req.params.userId,
        plan_id: Number(req.params.planId),
      },
      bodyObj,
      { new: true }
    );

    res.json(planToUpdate);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const updateSellingPlan = async (req, res) => {
  try {
    const planData = await userPlan.findOne({
      business: req.params.userId,
      plan_id: req.body.planId,
    });

    if (!planData) {
      return res.status(404).json({ error: "Plan not found for User" });
    }

    // Update the plan fields as needed
    // planData.selling_price = Number(req.body.selling_price);
    const newSellingPrice = Number(req.body.selling_price);

    // Save the user to persist the changes
    // await planData.save();

    await userPlan.findOneAndUpdate(
      {
        business: req.params.userId,
        plan_id: req.body.planId,
      },
      {
        selling_price: newSellingPrice,
      },
      { new: true }
    );

    res.json(planData);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const deletePlanUser = async (req, res) => {
  try {
    const planData = await userPlan.findOne({
      business: req.params.userId,
      plan_id: req.body.planId,
    });

    if (!planData) {
      return res.status(404).json({ error: "Plan not found" });
    }

    await plan.deleteOne({
      business: req.params.userId,
      plan_id: req.body.planId,
    });

    res.sendStatus(204);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const validateCreate = (fields) => {
  const schema = Joi.object({
    plan_id: Joi.number().required(),
    network: Joi.string().valid("mtn", "airtel", "glo", "9mobile").required(),
    plan_type: Joi.string().valid("gifting", "sme", "data_transfer").required(),
    price: Joi.number().required(),
    volume: Joi.number().required(),
    unit: Joi.string().valid("mb", "gb", "tb").required(),
    validity: Joi.string().required(),
  });

  return schema.validate(fields);
};

const validateUpdate = (fields) => {
  const schema = Joi.object({
    plan_id: Joi.number(),
    network: Joi.string().valid("mtn", "airtel", "glo", "9mobile"),
    plan_type: Joi.string().valid("gifting", "sme", "data_transfer"),
    price: Joi.number(),
    volume: Joi.number(),
    unit: Joi.string().valid("mb", "gb", "tb"),
    validity: Joi.string(),
  });

  return schema.validate(fields);
};

module.exports = {
  getAllPlans,
  getOnePlan,
  createOnePlan,
  updateOnePlan,
  deleteOnePlan,
  deleteAllPlans,
  deleteNetworkPlans,
  // new plans
  createPlanUser,
  getPlansByUserId,
  deletePlanUser,
  updatePlanUser,
  updateSellingPlan,
};
