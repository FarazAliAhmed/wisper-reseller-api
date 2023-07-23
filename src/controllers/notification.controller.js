const {
  getAll,
  checkAdd,
  addNotificationService,
  addAdminNoti,
} = require("../services/notification.service");

const addNotification = async (req, res) => {
  try {
    const { error } = ValidateNotification(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const notification = await addNotificationService(req.body);

    res.json(notification);
  } catch (error) {
    console.error("Error adding notification:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const getAllNotification = async (req, res) => {
  const { business_id } = req.body;

  const resp = await getAll(business_id);

  console.log("resp", resp);

  if (resp.notification) return res.status(200).json(resp.notification);
  return res.status(resp.status).json(resp);
};

const checkAddNotification = async (req, res) => {
  const { business_id } = req.body;
  const resp = await checkAdd(business_id);
  console.log("resp", resp);
  return res.status(resp.status).json(resp);
};

const addAdminNotification = async (req, res) => {
  const { content } = req.body;
  const resp = await addAdminNoti(content);

  if (resp.notification) return res.status(200).json(resp.notification);
  return res.status(resp.status).json(resp);
};

const ValidateNotification = (requestBody) => {
  const schema = Joi.object({
    business: Joi.string().required(),
    content: Joi.string().required(),
    status: Joi.string()
      .valid("urgent", "info", "critical", "warning")
      .required(),
    color: Joi.string().required(),
    hasRead: Joi.boolean().required(),
  });

  return schema.validate(requestBody);
};

module.exports = {
  addNotification,
  getAllNotification,
  checkAddNotification,
  addAdminNotification,
};
