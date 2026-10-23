const axios = require("axios");

/**
 * GLO Enterprise Gifting (EGMS) API Helper
 * Docs: "EGMS API Document" v1.0 (Globacom)
 *
 * Only the client's own bucket may be debited. The bucket ID is pinned here on purpose:
 * the sponsor account holds other buckets that are NOT ours and must never be used.
 */
const EGMS_BASE_URL = "https://gift-api.gloworld.com";
const EGMS_ALLOWED_BUCKET_ID = 306; // client's bucket ("palmpay3", 157.5 TB)

const egms_api_key = process.env.GLO_EGMS_API_KEY;
const egms_sponsor_id = process.env.GLO_EGMS_SPONSOR_ID || "palmpay";

// Result codes that mean GLO did NOT gift anything, so another supplier can safely be tried
const EGMS_DEFINITE_FAILURES = new Set([
  "401001", "401002", "401003",
  "404001", "404002", "404003",
  "405001", "405002", "405003", "405004", "405005", "405006", "405007", "405008", "405009",
]);

// Our GLO plan_id -> EGMS planId (bucket 306 plan list, Oct 2026). GLO_EGMS_PLANS (JSON) can override entries.
const EGMS_DEFAULT_PLANS = {
  701: 910, // 200MB 14 days  (CGIFT_200_14)
  702: 912, // 500MB 30 days  (CGIFT_500_30)
  703: 913, // 1GB 30 days    (CGIFT_1GB)
  704: 914, // 2GB 30 days    (CGIFT_2GB)
  705: 915, // 3GB 30 days    (CGIFT_ 3GB)
  706: 916, // 5GB 30 days    (CGIFT_5GB)
  707: 917, // 10GB 30 days   (CGIFT_10GB)
  709: 919, // 1GB 3 days     (CGIFT_1GB_3)
  710: 920, // 3GB 3 days     (CGIFT_3GB_3)
  711: 921, // 5GB 3 days     (CGIFT_5GB_3)
  712: 922, // 1GB 7 days     (CGIFT_1GB_7)
  713: 923, // 3GB 7 days     (CGIFT_3GB_7)
  714: 924, // 5GB 7 days     (CGIFT_5GB_7)
};
const egms_plan_map = (() => {
  try {
    return { ...EGMS_DEFAULT_PLANS, ...JSON.parse(process.env.GLO_EGMS_PLANS || "{}") };
  } catch (e) {
    console.log("GLO_EGMS_PLANS is not valid JSON");
    return EGMS_DEFAULT_PLANS;
  }
})();

const egms_glo_plan = (our_plan_id) => {
  const plan_id = Number(egms_plan_map[String(our_plan_id)]);
  return plan_id ? { error: false, plan_id } : { error: true };
};

// EGMS wants 234XXXXXXXXXX
const to_msisdn = (phone) => {
  const p = String(phone).replace(/\D/g, "");
  if (p.startsWith("234")) return p;
  if (p.startsWith("0")) return "234" + p.slice(1);
  return "234" + p;
};

// transId must be 5-20 characters
const to_trans_id = (ref) => String(ref || Date.now()).replace(/[^A-Za-z0-9]/g, "").slice(-20);

class EgmsHelper {
  static isConfigured() {
    return Boolean(egms_api_key && egms_sponsor_id);
  }

  static getHeaders() {
    return { "Content-Type": "application/json", "x-api-key": egms_api_key };
  }

  /**
   * Gift a plan from our bucket.
   * Returns { error, definiteFailure, response, message }.
   * definiteFailure = true only when GLO confirms nothing was gifted (safe to fall back).
   */
  static async purchaseData(plan_id, phone, ref) {
    const transId = to_trans_id(ref);
    const body = {
      transId,
      msisdn: to_msisdn(phone),
      bucketId: EGMS_ALLOWED_BUCKET_ID,
      planId: Number(plan_id),
      sponsorId: egms_sponsor_id,
      quantity: 1,
      ignoresms: false,
    };

    try {
      console.log("EGMS REQUEST:", { transId, msisdn: body.msisdn, planId: body.planId });
      const response = await axios.post(`${EGMS_BASE_URL}/`, body, { headers: this.getHeaders(), timeout: 30000 });
      return this.parseGiftResponse(response.data, transId);
    } catch (error) {
      const data = error?.response?.data;
      console.log("EGMS ERROR:", data || error.message);
      if (data && data.resultCode) return this.parseGiftResponse(data, transId);
      // No clear answer (timeout / network): ask GLO what happened before deciding
      return await this.resolveUnknown(transId);
    }
  }

  static parseGiftResponse(data, transId) {
    const code = String(data?.resultCode || "");
    console.log("EGMS RESPONSE:", data);
    // 0000 success, 0001 created, 0002 pending (being processed)
    if (data?.status === "ok" && ["0000", "0001", "0002"].includes(code)) {
      return { error: false, response: data, message: data.message || "Transaction is successful", transId };
    }
    return {
      error: true,
      status: 400,
      definiteFailure: EGMS_DEFINITE_FAILURES.has(code),
      message: data?.message || "Data purchase failed",
      transId,
    };
  }

  static async checkStatus(transId) {
    try {
      const response = await axios.post(
        `${EGMS_BASE_URL}/status/`,
        { transId, sponsorId: egms_sponsor_id },
        { headers: this.getHeaders(), timeout: 20000 }
      );
      return response.data;
    } catch (error) {
      return error?.response?.data || null;
    }
  }

  static async resolveUnknown(transId) {
    const data = await this.checkStatus(transId);
    if (data?.status === "ok") {
      return { error: false, response: data, message: data.transaction_details || "Transaction is successful", transId };
    }
    // "Transaction not found" means GLO never received it, so another supplier is safe
    const notFound = /not found/i.test(data?.message || "");
    return { error: true, status: 400, definiteFailure: notFound, message: "Data purchase failed", transId };
  }
}

module.exports = { EgmsHelper, egms_glo_plan, EGMS_ALLOWED_BUCKET_ID };
