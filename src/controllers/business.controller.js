const Joi = require("joi");
const {
  getAll,
  getOne,
  getAdmins,
  enableAccount,
  disableAccount,
  updateAccountType,
} = require("../services/business.service");

const { getBalance } = require("../services/balance.service");

const getAllBusiness = async (req, res, next) => {
  const resp = await getAll();
  if (resp.error) return res.status(400).json(resp);

  let business = {
    mega: [],
    lite: [],
    subdealer: [],
  };
  resp.business.forEach((buss) => {
    if (buss.type === "mega") {
      business.mega.push(buss);
    } else if (buss.type === "agent") {
      business.subdealer.push(buss);
    } else {
      business.lite.push(buss);
    }
  });
  return res.status(200).json(business);
};

const getOneBusiness = async (req, res, next) => {
  const account_id = req.params.account_id;
  const resp = await Promise.all([getOne(account_id), getBalance(account_id)]);
  if (resp[0].error) return res.status(400).json(resp[0]);
  if (resp[1].error || resp[1].status === 500)
    return res.status(400).json(resp[1]);
  const returnObj = {
    business: resp[0].business,
    balance: resp[1].balance,
  };
  return res.status(200).json(returnObj);
};

const getSystemAdmins = async (req, res, next) => {
  const resp = await getAdmins();
  if (resp.error) return res.status(200).json(resp);
  return res.status(200).json(resp.admin);
};

const enableBusinessAccount = async (req, res) => {
  const { account_id } = req.params;
  const resp = await enableAccount(account_id);
  if (resp.error) return res.status(400).json(resp);
  return res.status(201).json({ status: "success", message: resp.message });
};

const disableBusinessAccount = async (req, res) => {
  const { account_id } = req.params;
  const resp = await disableAccount(account_id);
  if (resp.error) return res.status(400).json(resp);
  return res.status(201).json({ status: "success", message: resp.message });
};

const setBusinessAccountType = async (req, res) => {
  const { account_id, type } = req.body;
  const { error } = validateAccountType(req.body);
  if (error)
    return res
      .status(400)
      .json({ status: "failed", message: error.details[0].message });
  const resp = await updateAccountType(account_id, type);
  if (resp.error) return res.status(400).json(resp);
  return res.status(201).json({ status: "success", message: resp.message });
};

const validateAccountType = (fields) => {
  const schema = Joi.object({
    account_id: Joi.string().required(),
    type: Joi.string().valid("lite", "mega"),
  });
  return schema.validate(fields);
};

module.exports = {
  getAllBusiness,
  getOneBusiness,
  getSystemAdmins,
  enableBusinessAccount,
  disableBusinessAccount,
  setBusinessAccountType,
};
