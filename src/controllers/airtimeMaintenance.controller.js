const Joi = require("joi");
const Maintenance = require("../models/maintenance");
const airtimeMaintenance = require("../models/airtimeMaintenance");

const getAirtimeMaintenance = async (req, res) => {
  const existMain = await airtimeMaintenance.findOne().exec();
  return res
    .status(200)
    .json({ maintenance: existMain, message: `Successfully fetched` });
};

const createAirtimeMaintenance = async (req, res) => {
  const existMain = await airtimeMaintenance.find().exec();
  if (existMain.length > 0) {
    return res
      .status(200)
      .json({ messsage: "Maintenance object already created" });
  }
  const newMain = new airtimeMaintenance({});
  const maintenanceRes = await newMain.save();
  return res.status(201).json(maintenanceRes);
};

const enterAirtimeMaintenance = async (req, res) => {
  const { network } = req.params;
  const { error } = validateMaintenaceUpdate(network);
  if (error)
    return res
      .status(400)
      .json({ status: "failed", message: error.details[0].message });
  const enterMain = await airtimeMaintenance
    .findOneAndUpdate({}, { [network]: true }, { new: true })
    .exec();
  return res.status(201).json({
    maintenance: enterMain,
    message: `${network} is now in maintenace mood`,
  });
};

const exitAirtimeMaintenance = async (req, res) => {
  const { network } = req.params;
  const { error } = validateMaintenaceUpdate(network);
  if (error)
    return res
      .status(400)
      .json({ status: "failed", message: error.details[0].message });
  const enterMain = await airtimeMaintenance
    .findOneAndUpdate({}, { [network]: false }, { new: true })
    .exec();
  return res.status(201).json({
    maintenance: enterMain,
    message: `${network} is now in maintenace mood`,
  });
};

const setAirtimeNoticeMessag = async (req, res) => {
  const { message } = req.body;
  const { error } = validateMaintenaceMessage(req.body);
  if (error)
    return res
      .status(400)
      .json({ status: "failed", message: error.details[0].message });
  const setMessage = await airtimeMaintenance
    .findOneAndUpdate({}, { notice: message }, { new: true })
    .exec();
  return res.status(201).json({
    maintenance: setMessage,
    message: "The maintenace messsage has been set successfully",
  });
};

const clearAirtimeNoticeMessag = async (req, res) => {
  const setMessage = await airtimeMaintenance
    .findOneAndUpdate({}, { notice: null }, { new: true })
    .exec();
  return res.status(201).json({
    maintenance: setMessage,
    message: "Maintenace messsage has been cleared successfully",
  });
};

const validateMaintenaceUpdate = (field) => {
  const schema = Joi.string()
    .valid("glo", "airtel", "9mobile", "mtn")
    .required();
  return schema.validate(field);
};

const validateMaintenaceMessage = (fields) => {
  const schema = Joi.object({
    message: Joi.string(),
  });
  return schema.validate(fields);
};

module.exports = {
  getAirtimeMaintenance,
  createAirtimeMaintenance,
  enterAirtimeMaintenance,
  exitAirtimeMaintenance,
  setAirtimeNoticeMessag,
  clearAirtimeNoticeMessag,
};
