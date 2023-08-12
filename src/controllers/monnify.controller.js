const Joi = require("joi");
const monnifyService = require("../services/monnify.service");

class MonnifyController {
  async addBalance(req, res) {
    try {
      // Validate the request body
      const { error, value: addData } = addBalanceSchema.validate(req.body);
      if (error) {
        return res.status(400).json({ message: error.details[0].message });
      }

      const updatedBalance = await monnifyService.addBalanceByBusinessId(
        addData
      );

      return res.json(updatedBalance);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "An error occurred" });
    }
  }
}

module.exports = new MonnifyController();

const addBalanceSchema = Joi.object({
  business: Joi.string().required(),
  amount: Joi.number().min(0).required(),
});
