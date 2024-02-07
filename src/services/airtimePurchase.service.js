const apiBalanceModel = require("../models/apiBalance.model");
const { ApiAirtimeHelper } = require("../utils/airtime/apiAirtimeHelper");

const map_network_reverse = { 1: "mtn", 3: "glo", 2: "airtel", 4: "9mobile" };

class AirtimePurchaseService {
  static async topupAirtime(network, phone, plan_type, volume, requestId) {
    let response = await ApiAirtimeHelper.Gladtidings(network, volume, phone);

    // await apiBalanceModel.findOneAndUpdate(
    //   {
    //     api: "n3tdata",
    //     network: map_network_reverse[network],
    //     type: "airtime",
    //   },
    //   { $set: { volume: Number(response.data.newbal) } }
    // );

    return response;
  }
}

module.exports = {
  AirtimePurchaseService,
};
