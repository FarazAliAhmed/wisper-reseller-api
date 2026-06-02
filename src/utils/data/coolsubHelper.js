const axios = require("axios");

const coolsub_token = process.env.COOLSUB_API_KEY;
const coolsub_base_url = "https://www.cool-sub.com";

/**
 * Cool-Sub API Helper
 * Used for GLO Corporate Gifting data plans
 */
class CoolSubHelper {

  static getHeaders() {
    return {
      "Content-Type": "application/json",
      "Authorization": `Token ${coolsub_token}`,
    };
  }

  /**
   * Purchase data via Cool-Sub
   * @param {number} network - 1=MTN, 2=GLO, 3=9MOBILE, 4=AIRTEL
   * @param {string} plan_id - plan dataplan_id from cool-sub
   * @param {string} phone - phone number
   * @param {boolean} ported - whether number is ported
   */
  static async purchaseData(network, plan_id, phone, ported = false) {
    try {
      console.log("COOLSUB REQUEST:", { network, plan_id, phone });

      const response = await axios.post(
        `${coolsub_base_url}/api/data/`,
        {
          network: network,
          mobile_number: phone,
          plan: plan_id,
          Ported_number: ported,
        },
        { headers: this.getHeaders() }
      );

      console.log("COOLSUB RESPONSE:", response.data);

      const data = response.data;

      if (data.Status === "successful" || data.Status === "success") {
        return {
          error: false,
          response: data,
          message: data.api_response || `Data purchase successful for ${phone}`,
        };
      } else {
        return {
          error: true,
          status: 400,
          message: data.api_response || data.Status || "Cool-Sub data purchase failed",
        };
      }
    } catch (error) {
      console.log("COOLSUB ERROR:", error?.response?.data || error.message);
      return {
        error: true,
        status: 400,
        message: error?.response?.data?.message || "Cool-Sub data purchase failed",
      };
    }
  }

  /**
   * Check Cool-Sub wallet balance
   */
  static async checkBalance() {
    try {
      const response = await axios.get(
        `${coolsub_base_url}/api/user/`,
        { headers: this.getHeaders() }
      );
      return response.data?.user?.wallet_balance || 0;
    } catch (error) {
      console.log("COOLSUB balance error:", error?.response?.data || error.message);
      return null;
    }
  }
}

// Cool-Sub GLO Corporate Gifting size map (Network ID = 2)
const coolsub_glo_size_map = (size) => {
  const f_size = size.trim().toLowerCase().replace(/\.0\s*/g, '').replace(/\s+/g, '');
  let error = false, plan_id;

  switch (f_size) {
    case "500mb": plan_id = 233; break; // 500MB Monthly ₦197.5
    case "1gb":   plan_id = 235; break; // 1GB Monthly ₦395
    case "2gb":   plan_id = 236; break; // 2GB Monthly ₦790
    case "3gb":   plan_id = 237; break; // 3GB Monthly ₦1,179
    case "5gb":   plan_id = 238; break; // 5GB Monthly ₦1,975
    case "10gb":  plan_id = 239; break; // 10GB Monthly ₦3,950
    default: error = true;
  }
  return { error, plan_id };
};

module.exports = { CoolSubHelper, coolsub_glo_size_map };
