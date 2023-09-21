const Joi = require("joi");
const Maintenance = require("../models/maintenance");
const megaMaintenance = require("../models/megaMaintenance");

const getMegaMaintenance = async (req, res) => {
  const existMain = await megaMaintenance.findOne().exec();
  return res
    .status(200)
    .json({ maintenance: existMain, message: `Successfully fetched` });
};

const createMegaMaintenance = async (req, res) => {
  const existMain = await megaMaintenance.find().exec();
  if (existMain.length > 0) {
    return res
      .status(200)
      .json({ messsage: "Maintenance object already created" });
  }
  const newMain = new megaMaintenance({});
  const maintenanceRes = await newMain.save();
  return res.status(201).json(maintenanceRes);
};

const enterMegaMaintenance = async (req, res) => {
  const { network } = req.params;
  const { error } = validateMaintenaceUpdate(network);
  if (error)
    return res
      .status(400)
      .json({ status: "failed", message: error.details[0].message });
  const enterMain = await megaMaintenance
    .findOneAndUpdate({}, { [network]: true }, { new: true })
    .exec();
  return res.status(201).json({
    maintenance: enterMain,
    message: `${network} is now in maintenace mood`,
  });
};

const exitMegaMaintenance = async (req, res) => {
  const { network } = req.params;
  const { error } = validateMaintenaceUpdate(network);
  if (error)
    return res
      .status(400)
      .json({ status: "failed", message: error.details[0].message });
  const enterMain = await megaMaintenance
    .findOneAndUpdate({}, { [network]: false }, { new: true })
    .exec();
  return res.status(201).json({
    maintenance: enterMain,
    message: `${network} is now in maintenace mood`,
  });
};

const setMegaNoticeMessag = async (req, res) => {
  const { message } = req.body;
  const { error } = validateMaintenaceMessage(req.body);
  if (error)
    return res
      .status(400)
      .json({ status: "failed", message: error.details[0].message });
  const setMessage = await megaMaintenance
    .findOneAndUpdate({}, { notice: message }, { new: true })
    .exec();
  return res.status(201).json({
    maintenance: setMessage,
    message: "The maintenace messsage has been set successfully",
  });
};

const clearMegaNoticeMessag = async (req, res) => {
  const setMessage = await megaMaintenance
    .findOneAndUpdate({}, { notice: null }, { new: true })
    .exec();
  return res.status(201).json({
    maintenance: setMessage,
    message: "Maintenace messsage has been cleared successfully",
  });
};

const validateMaintenaceUpdate = (field) => {
  const schema = Joi.string()
    .valid("glo", "mtn_sme", "mtn_gifting", "airtel", "9mobile")
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
  getMegaMaintenance,
  createMegaMaintenance,
  enterMegaMaintenance,
  exitMegaMaintenance,
  setMegaNoticeMessag,
  clearMegaNoticeMessag,
};
