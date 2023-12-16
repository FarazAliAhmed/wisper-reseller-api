const Joi = require("joi");
const storeFrontMaintenance = require("../models/storeFrontMaintenance");

const getStoreFrontMaintenance = async (req, res) => {
  const existMain = await storeFrontMaintenance.findOne().exec();
  return res
    .status(200)
    .json({ maintenance: existMain, message: `Successfully fetched` });
};

const createStoreFrontMaintenance = async (req, res) => {
  const existMain = await storeFrontMaintenance.find().exec();
  if (existMain.length > 0) {
    return res
      .status(200)
      .json({ messsage: "Maintenance object already created" });
  }
  const newMain = new storeFrontMaintenance({});
  const maintenanceRes = await newMain.save();
  return res.status(201).json(maintenanceRes);
};

const enterStoreFrontMaintenance = async (req, res) => {
  const { network } = req.params;
  const { error } = validateMaintenaceUpdate(network);
  if (error)
    return res
      .status(400)
      .json({ status: "failed", message: error.details[0].message });
  const enterMain = await storeFrontMaintenance
    .findOneAndUpdate({}, { [network]: true }, { new: true })
    .exec();
  return res.status(201).json({
    maintenance: enterMain,
    message: `${network} is now in maintenace mood`,
  });
};

const exitStoreFrontMaintenance = async (req, res) => {
  const { network } = req.params;
  const { error } = validateMaintenaceUpdate(network);
  if (error)
    return res
      .status(400)
      .json({ status: "failed", message: error.details[0].message });
  const enterMain = await storeFrontMaintenance
    .findOneAndUpdate({}, { [network]: false }, { new: true })
    .exec();
  return res.status(201).json({
    maintenance: enterMain,
    message: `${network} is now in maintenace mood`,
  });
};

const setStoreFrontNoticeMessag = async (req, res) => {
  const { message } = req.body;
  const { error } = validateMaintenaceMessage(req.body);
  if (error)
    return res
      .status(400)
      .json({ status: "failed", message: error.details[0].message });
  const setMessage = await storeFrontMaintenance
    .findOneAndUpdate({}, { notice: message }, { new: true })
    .exec();
  return res.status(201).json({
    maintenance: setMessage,
    message: "The maintenace messsage has been set successfully",
  });
};

const clearStoreFrontNoticeMessag = async (req, res) => {
  const setMessage = await storeFrontMaintenance
    .findOneAndUpdate({}, { notice: null }, { new: true })
    .exec();
  return res.status(201).json({
    maintenance: setMessage,
    message: "Maintenace messsage has been cleared successfully",
  });
};

const validateMaintenaceUpdate = (field) => {
  const schema = Joi.string().valid("withdrawal", "purchase").required();
  return schema.validate(field);
};

const validateMaintenaceMessage = (fields) => {
  const schema = Joi.object({
    message: Joi.string(),
  });
  return schema.validate(fields);
};

module.exports = {
  getStoreFrontMaintenance,
  createStoreFrontMaintenance,
  enterStoreFrontMaintenance,
  exitStoreFrontMaintenance,
  setStoreFrontNoticeMessag,
  clearStoreFrontNoticeMessag,
};
