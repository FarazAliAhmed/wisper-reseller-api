const axios = require("axios");

class AirtimePurchaseService {
  static async topupAirtime(network, phone, plan_type, volume, requestId) {
    const reqConfig = {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Token ${process.env.N3TDATA_TOKEN}`,
        Accept: "application/json",
      },
    };

    const reqBody = {
      network,
      phone,
      plan_type,
      amount: volume,
      bypass: false,
      volume,
      "request-id": requestId,
    };

    try {
      const response = await axios.post(
        `${process.env.N3TDATA_URL}/topup`,
        reqBody,
        reqConfig
      );

      console.log(response?.data);

      if (response.data.status != "success") {
        throw new Error(`${response.data.message}`);
      }
      return {
        error: false,
        status: response.status,
        message: "Request successful",
        data: response.data.message,
      };
    } catch (error) {
      console.log(error.response.data);
      return {
        error: true,
        status: error.response?.status || 500,
        message: error.message,
      };
    }
  }
}

module.exports = {
  AirtimePurchaseService,
};
