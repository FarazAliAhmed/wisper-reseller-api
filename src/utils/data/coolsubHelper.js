const axios = require("axios");

const coolsub_token = process.env.COOLSUB_API_KEY;
// Cool-Sub moved to a new platform; v2 serves the old MSORG endpoints with the same request format
const coolsub_base_url = process.env.COOLSUB_BASE_URL || "https://v2.cool-sub.com";

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
    // The network rate-limits bursts ("HTTP 429 RATE_LIMIT_EXCEEDED, retryAfterSeconds: 1").
    // Retry only on that explicit reply: the order was rejected, so a retry cannot double-deliver.
    const MAX_RETRIES = 3;
    for (let attempt = 0; ; attempt++) {
      const result = await this.purchaseDataOnce(network, plan_id, phone, ported);
      if (!result.rateLimited || attempt >= MAX_RETRIES) return result;
      const waitMs = (result.retryAfterSeconds || 1) * 1000 + Math.floor(Math.random() * 500);
      console.log(`COOLSUB RATE LIMITED: retry ${attempt + 1} in ${waitMs}ms`);
      await new Promise((resolve) => setTimeout(resolve, waitMs));
    }
  }

  static async purchaseDataOnce(network, plan_id, phone, ported = false) {
    const rateLimitInfo = (body, httpStatus) => {
      const text = String(body?.api_response || body?.error || body?.message || "");
      const rateLimited = httpStatus === 429 || /RATE_LIMIT|HTTP 429/i.test(text);
      const retryAfterSeconds = Number((text.match(/retryAfterSeconds:\s*(\d+)/i) || [])[1]) || 1;
      return { rateLimited, retryAfterSeconds };
    };

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
      // Old Cool-Sub returns { Status }, v2 may return { status } or { success, data: { status } }
      const status = String(data.Status || data.status || data.data?.status || "").toLowerCase();

      if (status === "successful" || status === "success" || data.success === true) {
        return {
          error: false,
          response: data,
          message: data.api_response || data.message || `Data purchase successful for ${phone}`,
        };
      } else {
        return {
          error: true,
          status: 400,
          message: data.api_response || data.error || data.message || data.Status || "Data purchase failed",
          ...rateLimitInfo(data),
        };
      }
    } catch (error) {
      console.log("COOLSUB ERROR:", error?.response?.data || error.message);
      const body = error?.response?.data;
      return {
        error: true,
        status: 400,
        message: body?.api_response || body?.error || body?.message || "Data purchase failed",
        ...rateLimitInfo(body, error?.response?.status),
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

// Our 3-day / 7-day GLO plan_ids -> Cool-Sub legacy plan IDs
const coolsub_glo_short_validity_plans = {
  709: 358, // 1GB 3 days
  710: 359, // 3GB 3 days
  711: 360, // 5GB 3 days
  712: 361, // 1GB 7 days
  713: 362, // 3GB 7 days
  714: 363, // 5GB 7 days
};

// Cool-Sub GLO Corporate Gifting size map (Network ID = 2)
const coolsub_glo_size_map = (size, our_plan_id) => {
  const short_plan = coolsub_glo_short_validity_plans[Number(our_plan_id)];
  if (short_plan) return { error: false, plan_id: short_plan };

  const f_size = size.trim().toLowerCase().replace(/\.0\s*/g, '').replace(/\s+/g, '');
  let error = false, plan_id;

  switch (f_size) {
    // Legacy plan IDs, still accepted by v2 (wallet prices as of Sep 2026)
    case "200mb": plan_id = 234; break; // 200MB Monthly ₦83
    case "500mb": plan_id = 233; break; // 500MB Monthly ₦208
    case "1gb":   plan_id = 235; break; // 1GB Monthly ₦425
    case "2gb":   plan_id = 236; break; // 2GB Monthly ₦850
    case "3gb":   plan_id = 237; break; // 3GB Monthly ₦1,275
    case "5gb":   plan_id = 238; break; // 5GB Monthly ₦2,125
    case "10gb":  plan_id = 239; break; // 10GB Monthly ₦4,250
    default: error = true;
  }
  return { error, plan_id };
};

module.exports = { CoolSubHelper, coolsub_glo_size_map };
