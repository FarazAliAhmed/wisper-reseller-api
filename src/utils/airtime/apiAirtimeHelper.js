const axios = require("axios");
const gladtidings_token = process.env.GLADTIDINGS_TOKEN;

class ApiAirtimeHelper {
  static async Gladtidings(network_id, amount, phone) {
    const req_header = {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Token ${gladtidings_token}`,
        Accept: "application/json",
      },
    };

    const req_body = {
      network: network_id,
      amount: amount,
      mobile_number: phone,
      Ported_number: false,
      airtime_type: "VTU",
    };

    // console.log({ req_body });

    let response = await axios.post(
      `https://www.gladtidingsdata.com/api/topup/`,
      req_body,
      req_header
    );

    console.log({ response: response.data });

    if (response.data.Status == "successful") {
      console.log(response.data.Status);

      return {
        error: false,
        response: response.data,

        message: `Topup purchase of ₦${amount} for ${phone} successful`,
      };
    } else {
      return {
        error: true,
        status: 400,
        message: "An error occured with data transfer server",
      };
    }
  }
}

module.exports = { ApiAirtimeHelper };
