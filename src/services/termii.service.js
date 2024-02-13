const { default: axios } = require("axios");

class TermiiService {
  static sendNumberAPI = async (phoneNumber, sms) => {
    // phoneNumber example -- 2348024685574
    // sms example -- Hello there wellcome to our platform

    const data = {
      to: `234${String(phoneNumber).slice(1)}`,
      sms: `${sms}`,
      api_key: `${process.env.TERMII_API_KEY}`,
      channel: "generic",
      from: "N-Alert",
      type: "plain",
    };

    const headers = {
      "Content-Type": "application/json",
    };

    try {
      const response = await axios
        .post("https://api.ng.termii.com/api/sms/send", data, headers)
        .catch((e) => {
          console.log({ error: e.response.data.message });
        });

      return {
        error: false,
        message: `SMS sent successfully to ${phoneNumber}`,
        data: response.data,
      };
    } catch (error) {
      return {
        error: true,
        message: `Unable to send Catch SMS to ${phoneNumber}`,
      };
    }
  };
}

module.exports = {
  TermiiService,
};
