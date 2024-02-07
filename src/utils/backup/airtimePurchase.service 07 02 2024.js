const axios = require("axios");
const apiBalanceModel = require("../models/apiBalance.model");

const map_network_reverse = { 1: "mtn", 3: "glo", 2: "airtel", 4: "9mobile" };

class AirtimePurchaseService {
  static async topupAirtime(network, phone, plan_type, volume, requestId) {
    const reqConfig = {
      headers: {
        "Content-Type": "application/json",
        "api-key": `${process.env.VTPASS_API_KEY}/topup`,
        "secret-key": `${process.env.VTPASS_API_SECRET}/topup`,
        Accept: "application/json",
      },
    };

    const reqBody = {
      serviceID: network,
      phone,
      amount: volume,
      request_id: requestId,
    };

    try {
      const response = await axios.post(
        `${process.env.VTPASS_URL}`,
        reqBody,
        reqConfig
      );

      console.log(response?.data);

      await apiBalanceModel.findOneAndUpdate(
        {
          api: "n3tdata",
          network: map_network_reverse[network],
          type: "airtime",
        },
        { $set: { volume: Number(response.data.newbal) } }
      );

      if (response.data.status != "success") {
        throw new Error(`${response.data.message}`);
      }
      return {
        error: false,
        status: response.status,
        message: "Airtime Purchase successful",
        data: response.data.message,
      };
    } catch (error) {
      console.log({ message: error.message });
      console.log(error.response.data);
      return {
        error: true,
        status: error.response?.status || 500,
        message: "An error occurred during the airtime purchase.",
      };
    }
  }
}

module.exports = {
  AirtimePurchaseService,
};
