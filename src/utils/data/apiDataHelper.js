const axios = require("axios");
const { ayinlakApiUpdateBalance } = require("../middleware/api.helper");

const ayinlak_token = process.env.AYINLAK_TOKEN;
const ayinlak_url = process.env.AYINLAK_URL;

const n3tdata_token = process.env.N3TDATA_TOKEN;
const n3tdata_url = process.env.N3TDATA_URL;

const wazobia_token = process.env.WAZOBIA_TOKEN;
const wazobia_url = process.env.WAZOBIA_URL;

const autopilot_token = process.env.AUTOPILOT_API_KEY;
const autopilot_url = process.env.AUTOPILOT_URL;

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

      // console.log({ response: response?.data });

      if (
        String(response?.data?.status).toLowerCase() == "fail".toLowerCase()
      ) {
        throw new Error("data purchase failed");
      }

      if (
        String(response?.data?.status).toLowerCase() == "failed".toLowerCase()
      ) {
        throw new Error("data purchase failed");
      }

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

  static async Autopilot(network, plan_id, phone, transaction_ref) {
    console.log({ network, plan_id, phone, transaction_ref });

    console.log({ autopilot_token, autopilot_url });

    try {
      const req_header = {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${autopilot_token}`,
        },
      };

      const response = await axios.post(
        `${autopilot_url}/v1/data`,
        {
          networkId: network,
          dataType: "DATA TRANSFER",
          phone: phone,
          planId: plan_id,
          reference: transaction_ref,
        },
        req_header
      );

      // console.log({ response: response?.data });

      if (!response?.data?.status) {
        throw new Error("data purchase failed");
      }

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

  static async WazobiaNet(network, plan_id, phone) {
    console.log({ network, plan_id, phone });

    try {
      const req_header = {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Token ${wazobia_token}`,
        },
      };

      const response = await axios.post(
        `${wazobia_url}/data/`,
        {
          network_id: network,
          phone_number: phone,
          plan_id: plan_id,
          ported: false,
        },
        req_header
      );

      // console.log({ response: response?.data });

      if (
        String(response?.data?.status).toLowerCase() == "fail".toLowerCase()
      ) {
        throw new Error("data purchase failed");
      }

      if (
        String(response?.data?.status).toLowerCase() == "failed".toLowerCase()
      ) {
        throw new Error("data purchase failed");
      }

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
