const axios = require("axios");
const { ayinlakApiUpdateBalance } = require("../middleware/api.helper");

const ayinlak_token = process.env.AYINLAK_TOKEN;
const ayinlak_url = process.env.AYINLAK_URL;

const n3tdata_token = process.env.N3TDATA_TOKEN;
const n3tdata_url = process.env.N3TDATA_URL;

const wazobia_token = process.env.WAZOBIA_TOKEN;
const wazobia_url = process.env.WAZOBIA_URL;

const gladtidings_token = process.env.GLADTIDINGS_TOKEN;

const autopilot_token = process.env.AUTOPILOT_API_KEY;

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


  static async Gladtidings(network_id, plan_id, phone, ref) {
    const req_header = {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Token ${gladtidings_token}`,
        Accept: "application/json",
      },
    };

    const req_body = {
      network: network_id,
      mobile_number: phone,
      plan: plan_id,
      Ported_number: true,
      ident: ref
    };

    console.log({ req_body });

    let response = await axios.post(
      `https://www.gladtidingsdata.com/api/data/`,
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

  static async Autopilot(network_id, plan_id, phone, dataType, ref) {
    const req_header = {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${autopilot_token}`,
        Accept: "application/json",
      },
    };

    const req_body = {
      networkId: network_id,
      phone: phone,
      planId: plan_id,
      dataType: dataType,
      reference: ref
    };

    console.log({ req_body });

    let response = await axios.post(
      `https://autopilotng.com/api/live/v1/data`,
      req_body,
      req_header
    );

    console.log({ response: response.data });

    if (response.data.status) {
      console.log(response?.data?.status);

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

module.exports = { ApiDataHelper };
