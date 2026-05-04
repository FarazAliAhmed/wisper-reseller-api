const axios = require("axios");

const gsubz_api_key = process.env.GSUBZ_API_KEY;
const gsubz_base_url = process.env.GSUBZ_BASE_URL || "https://gsubz.com";

/**
 * GSUBZ API Helper
 * Docs: https://documenter.getpostman.com/view/16767782/UyxhnnZz
 * Used as fallback when Superjara is down
 */
class GsubzHelper {
  static getHeaders() {
    return {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${gsubz_api_key}`,
    };
  }

  /**
   * Purchase data via GSUBZ
   * @param {string} serviceID - e.g. "mtn_datashare", "glo_data", "etisalat_data"
   * @param {string} plan - plan value/ID from GSUBZ plans list
   * @param {string} phone - phone number without country code
   * @param {string} ref - unique transaction reference
   * @param {number} amount - amount to pay
   */
  static async purchaseData(serviceID, plan, phone, ref, amount) {
    try {
      console.log("GSUBZ REQUEST:", { serviceID, plan, phone, ref, amount });

      const payload = {
        serviceID,
        plan,
        phone,
        amount,
        requestID: ref,
      };

      const response = await axios.post(
        `${gsubz_base_url}/api/pay/`,
        new URLSearchParams({
          serviceID,
          plan,
          phone,
          amount: String(amount),
          requestID: ref,
        }).toString(),
        { 
          headers: { 
            'Authorization': `Bearer ${gsubz_api_key}`,
            'Content-Type': 'application/x-www-form-urlencoded'
          } 
        }
      );

      console.log("GSUBZ RESPONSE:", response.data);

      const data = response.data;

      // IMPORTANT: GSUBZ can return code 200 but status "failed"
      // Must check BOTH code AND status
      if (data.code == 200 && data.status !== "failed") {
        return {
          error: false,
          response: data,
          message: data.api_response || `Data purchase for ${phone} successful via GSUBZ`,
        };
      } else {
        return {
          error: true,
          status: 400,
          message: data.api_response || data.description || data.status || "GSUBZ data purchase failed",
        };
      }    } catch (error) {
      console.log("GSUBZ ERROR:", error?.response?.data || error.message);
      return {
        error: true,
        status: 400,
        message: error?.response?.data?.description || "GSUBZ data purchase failed",
      };
    }
  }

  /**
   * Check GSUBZ wallet balance
   */
  static async checkBalance() {
    try {
      const response = await axios.post(
        `${gsubz_base_url}/api/balance/`,
        new URLSearchParams({ api: gsubz_api_key }).toString(),
        { headers: { 'Authorization': `Bearer ${gsubz_api_key}`, 'Content-Type': 'application/x-www-form-urlencoded' } }
      );
      return response.data;
    } catch (error) {
      console.log("GSUBZ balance check error:", error?.response?.data || error.message);
      return null;
    }
  }
}

// GSUBZ MTN Data Share size map
// Plans: 500MB(179), 1GB(166), 2GB(167), 3GB(168), 5GB(357)
const gsubz_mtn_size_map = (size) => {
  const f_size = size.trim().toLowerCase().replace(/\.0\s*/g, '').replace(/\s+/g, '');
  let error = false, plan_id, amount;

  switch (f_size) {
    case "500mb": plan_id = "179"; amount = 600; break;
    case "1gb":   plan_id = "166"; amount = 800; break;
    case "2gb":   plan_id = "167"; amount = 1800; break;
    case "3gb":   plan_id = "168"; amount = 2700; break;
    case "5gb":   plan_id = "357"; amount = 3600; break;
    default: error = true;
  }
  return { error, plan_id, amount };
};

// GSUBZ GLO Data size map
// Plans: 500MB(500), 1GB(1000), 2GB(2000), 3GB(3000), 5GB(5000), 10GB(10000)
const gsubz_glo_size_map = (size) => {
  const f_size = size.trim().toLowerCase().replace(/\.0\s*/g, '').replace(/\s+/g, '');
  let error = false, plan_id, amount;

  switch (f_size) {
    case "500mb": plan_id = "500";   amount = 200;  break;
    case "1gb":   plan_id = "1000";  amount = 399;  break;
    case "2gb":   plan_id = "2000";  amount = 780;  break;
    case "3gb":   plan_id = "3000";  amount = 1197; break;
    case "5gb":   plan_id = "5000";  amount = 1995; break;
    case "10gb":  plan_id = "10000"; amount = 3990; break;
    default: error = true;
  }
  return { error, plan_id, amount };
};

// GSUBZ 9mobile (etisalat) Data size map
// Plans: 500MB(182), 1GB(298), 1.5GB(300), 2GB(299), 3GB(303), 5GB(304), 10GB(305)
const gsubz_9mobile_size_map = (size) => {
  const f_size = size.trim().toLowerCase().replace(/\.0\s*/g, '').replace(/\s+/g, '');
  let error = false, plan_id, amount;

  switch (f_size) {
    case "500mb": plan_id = "182"; amount = 250;  break;
    case "1gb":   plan_id = "298"; amount = 499;  break;
    case "1.5gb": plan_id = "300"; amount = 748;  break;
    case "2gb":   plan_id = "299"; amount = 998;  break;
    case "3gb":   plan_id = "303"; amount = 1498; break;
    case "5gb":   plan_id = "304"; amount = 2496; break;
    case "10gb":  plan_id = "305"; amount = 4992; break;
    default: error = true;
  }
  return { error, plan_id, amount };
};

module.exports = {
  GsubzHelper,
  gsubz_mtn_size_map,
  gsubz_glo_size_map,
  gsubz_9mobile_size_map,
};
