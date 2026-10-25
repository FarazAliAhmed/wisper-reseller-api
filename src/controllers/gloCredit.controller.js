const gloCredit = require("../services/gloCredit.service");

// GET /api/glo-credit - GLO wallet credit summary for the logged-in user
const getGloCredit = async (req, res) => {
  try {
    res.json(await gloCredit.getStatus(req.user._id));
  } catch (error) {
    res.status(400).json({ error: true, message: error.message });
  }
};

// POST /api/glo-credit/repay { amount? } - repay GLO data used, from the naira wallet
const repayGloCredit = async (req, res) => {
  try {
    res.json(await gloCredit.repay(req.user._id, req.body?.amount));
  } catch (error) {
    res.status(400).json({ error: true, message: error.message });
  }
};

// GET /api/admin/glo-credit/:id - admin view of a user's GLO credit
const adminGetGloCredit = async (req, res) => {
  try {
    res.json(await gloCredit.getStatus(req.params.id));
  } catch (error) {
    res.status(400).json({ error: true, message: error.message });
  }
};

// GET /api/admin/glo-credit - all GLO credit customers with consumption and outstanding bill
const adminListGloCredit = async (req, res) => {
  try {
    res.json(await gloCredit.listAll());
  } catch (error) {
    res.status(400).json({ error: true, message: error.message });
  }
};

module.exports = { getGloCredit, repayGloCredit, adminGetGloCredit, adminListGloCredit };
