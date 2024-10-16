const axios = require("axios");
const { ayinlakApiUpdateBalance } = require("../middleware/api.helper");

const ayinlak_token = process.env.AYINLAK_TOKEN;
const ayinlak_url = process.env.AYINLAK_URL;

const n3tdata_token = process.env.N3TDATA_TOKEN;
const n3tdata_url = process.env.N3TDATA_URL;

class ApiDataHelper {
  static async Ayinlak(network, plan_id, phone) {
    const req_header = {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Token ${ayinlak_token}`,
      },
    };

    const req_body = {
      network: Number(network),
      mobile_number: phone,
      plan: Number(plan_id),
      Ported_number: false,
    };

    // console.log({ req_header, req_body, ayinlak_url });

    const response = await axios.post(
      `${ayinlak_url}/data/`,
      req_body,
      req_header
    );

    // console.log({ response });

    // return response;

    if (
      response.data &&
      response.data.Status &&
      response.data.Status === "successful"
    ) {
      console.log("SUCCESS");
      console.log({
        error: false,
        response: response.data,
        message: response.data.api_response,
      });

      await ayinlakApiUpdateBalance(response);

      return {
        error: false,
        response: response.data,
        message: response.data.api_response,
      };
    } else {
      console.log({ error });
      console.log("ERROROR");
      console.log({
        error: true,
        status: 400,
        message: "An error occured with data transfer server",
      });
      return {
        error: true,
        status: 400,
        message: "An error occured with data transfer server",
      };
    }
  }

  static async N3tdata(network, plan_id, phone, transaction_ref) {
    console.log({ network, plan_id, phone, transaction_ref });

    try {
      const req_header = {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Token ${n3tdata_token}`,
        },
      };

      const response = await axios.post(
        `${n3tdata_url}/data`,
        {
          network: network,
          phone: phone,
          data_plan: plan_id,
          "request-id": transaction_ref,
          bypass: false,
        },
        req_header
      );

      // console.log({ req_header, req_body, ayinlak_url });

      console.log({ response: response?.data });

      // if(String(response?.data?.status).toLowerCase() != "success".toLowerCase() ){
      //   throw new Error("data purchase failed")
      // }

      // return response;

      return {
        error: false,
        response: response.data,
        message: response.data.message,
      };
    } catch (error) {
      console.log({ error: error?.response });
      console.log("ERROROR");
      console.log({
        error: true,
        status: 400,
        message: "An error occured with data transfer server",
      });
      return {
        error: true,
        status: 400,
        message: "An error occured with data transfer server",
      };
    }
  }
}

module.exports = { ApiDataHelper };
