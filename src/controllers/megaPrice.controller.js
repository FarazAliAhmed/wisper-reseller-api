const Joi = require("joi");
const megaPriceService = require("../services/megaPriceService");

class MegaPriceController {
  async updateMegaPrice(req, res) {
    try {
      // Validate the request body
      const { error, value: updateData } = updateMegaPriceSchema.validate(
        req.body
      );
      if (error) {
        return res.status(400).json({ message: error.details[0].message });
      }

      const updatedMegaPrice = await megaPriceService.updateOrCreateMegaPrice(
        updateData
      );
      if (!updatedMegaPrice) {
        return res.status(404).json({ message: "MegaPrice not found" });
      }
      return res.json(updatedMegaPrice);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "An error occurred" });
    }
  }

  async purchaseMegaData(req, res) {
    try {
      // Validate the request body
      const { error } = purchaseMegaDataSchema.validate(req.body);
      if (error) {
        return res.status(400).json({ message: error.details[0].message });
      }

      const { business_id, network, amount } = req.body;
      const updatedBalance = await megaPriceService.purchaseMegaData(
        business_id,
        network,
        amount
      );
      res.json(updatedBalance);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "An error occurred" });
    }
  }
}

module.exports = new MegaPriceController();

const purchaseMegaDataSchema = Joi.object({
  business_id: Joi.string().required(),
  network: Joi.string().min(0).optional(),
  amount: Joi.number().min(0).optional(),
});

const updateMegaPriceSchema = Joi.object({
  business_id: Joi.string().required(),
  mtn_sme: Joi.number().min(0).optional(),
  mtn_gifting: Joi.number().min(0).optional(),
  airtel: Joi.number().min(0).optional(),
  glo: Joi.number().min(0).optional(),
  "9mobile": Joi.number().min(0).optional(),
});
