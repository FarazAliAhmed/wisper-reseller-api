const axios = require("axios");

export function gatewayResponse(plan_id, phone_number) {
  const phone = phone_number;
  let volume,
    unit = "GB",
    validity = "30 days";

  switch (Number(plan_id)) {
    case 910:
      volume = 200;
      unit = "MB";
      validity = "14 days";
      break;
    case 912:
      volume = 500;
      unit = "MB";
      break;
    case 913:
      volume = 1;
      break;
    case 914:
      volume = 2;
      break;
    case 915:
      volume = 3;
      break;
    case 916:
      volume = 5;
      break;
    case 917:
      volume = 10;
      break;
    default:
      return "Data purchase was successful. You will be credited soon.";
  }

  const message = gatewayResponseTemplate(volume, unit, phone, validity);
  return message;
}

export const gatewayResponseTemplate = (volume, unit, phone, validity) => {
  return `You have successfully purchased ${volume} ${unit} of data to ${phone}, valid for ${validity}.`;
};

async function buyGloData(purchaseInfo) {
  const [url, key] = [process.env.GLO_BASE_URL, process.env.GLO_API_KEY];
  const config = {
    headers: { "x-api-key": key, "Content-Type": "application/json" },
  };

  const randomMax = BigInt("99849294974397393924");
  const randomMin = BigInt("10849294974397393924");
  const unit = BigInt(10);

  try {
    const response = await axios.get(
      "https://wisper-test.herokuapp.com/api/admin/getBucket"
    );
    const bucketIds = response.data.map((bucket) => bucket.bucketID);
    const data = await requestData(bucketIds);
    return data;
  } catch (error) {
    console.error("Error retrieving bucket IDs:", error);
    throw new Error(error.response?.data?.message || error.message);
  }

  async function requestData(bucketIds) {
    console.log("bucket ID", bucketIds);

    const payload = {
      msisdn: purchaseInfo.phone_number,
      planId: purchaseInfo.plan_id,
      sponsorId: "almamgt",
      quantity: 1,
      bucketId: 0,
      ignoresms: false,
      transId: Math.floor(
        Number(
          (BigInt(Math.floor(Math.random() * 10)) * (randomMax - randomMin)) /
            unit +
            randomMin
        )
      ).toString(),
    };

    let attempts = 0;
    let resp;
    let mainError;

    try {
      do {
        const currentBucketId =
          attempts < bucketIds.length ? bucketIds[attempts] : 73;
        payload.bucketId = currentBucketId;

        try {
          resp = await axios.post(url, JSON.stringify(payload), config);

          if (resp.data.status === "ok") {
            console.log("success", payload.bucketId);

            resp.data["actual_response"] = resp.data.message;
            resp.data.message = gatewayResponse(
              purchaseInfo.plan_id,
              purchaseInfo.phone_number
            );

            break;
          }
        } catch (error) {
          console.log("error", payload.bucketId);

          mainError = error;

          attempts++; // Increase the attempt count
        }
      } while (attempts < bucketIds.length);
    } catch (error) {
      throw new Error("All attempts failed");
    }

    if (!resp) {
      throw new Error(
        mainError.response?.data?.message ||
          mainError.message ||
          "All attempts failed"
      );
    }

    // return resp.data;
    return resp;
  }
}

module.exports = {
  buyGloData,
};
