/* eslint-disable no-useless-catch */

const transactionHistory = require("../models/transactionHistory");
const { CustomError } = require("../utils/middleware/customError");

class HelperService {
  async calculateTotalVolume(startDate, endDate, type) {
    try {
      const filter = {
        createdAt: {
          $gte: new Date(startDate),
          $lt: new Date(endDate),
        },
        status: type,
      };

      const result = await transactionHistory.aggregate([
        { $match: filter },
        {
          $group: {
            _id: null,
            totalDataVolume: { $sum: "$data_volume" },
          },
        },
      ]);

      return result;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new HelperService();
