const megaPrice = require("../models/megaPrice");

class MegaPriceService {
  async updateOrCreateMegaPrice(updateData) {
    try {
      const filter = { business_id: updateData.business_id };
      const options = { upsert: true, new: true, setDefaultsOnInsert: true };

      const updatedMegaPrice = await megaPrice.findOneAndUpdate(
        filter,
        updateData,
        options
      );

      return updatedMegaPrice;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new MegaPriceService();
