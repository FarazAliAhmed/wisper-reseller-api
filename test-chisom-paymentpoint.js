#!/usr/bin/env node

/**
 * Test PaymentPoint API with Chisom Alaoma's actual details
 */

require("dotenv").config({ path: __dirname + "/.env" });
const axios = require("axios");

async function testWithChisom() {
  try {
    console.log("=== TESTING WITH CHISOM ALAOMA ===\n");

    const API_KEY = process.env.PAYMENTPOINT_API_KEY;
    const SECRET_KEY = process.env.PAYMENTPOINT_SECRET_KEY;
    const BASE_URL = "https://api.paymentpoint.co";

    // Chisom's actual details
    const payload = {
      email: "chisomalaoma@gmail.com",
      name: "Chisom Alaoma",
      phoneNumber: "09057790907",
      bankCode: ['20946', '20897'],
      businessId: "71e885f182ed5ea4454ef5e1d7e9a2ec40d1b36"
    };

    console.log("📤 REQUEST:");
    console.log("URL: POST", `${BASE_URL}/api/v1/createVirtualAccount`);
    console.log("\nPayload:");
    console.log(JSON.stringify(payload, null, 2));
    console.log("");

    const headers = {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${SECRET_KEY}`,
      "api-key": API_KEY,
    };

    console.log("Sending request...\n");

    const response = await axios.post(
      `${BASE_URL}/api/v1/createVirtualAccount`,
      payload,
      { headers }
    );

    console.log("✅ SUCCESS!\n");
    console.log("📥 RESPONSE:");
    console.log("Status:", response.status, response.statusText);
    console.log("\nResponse Body:");
    console.log(JSON.stringify(response.data, null, 2));

  } catch (error) {
    console.log("❌ ERROR!\n");
    console.log("📥 RESPONSE:");
    
    if (error.response) {
      console.log("Status:", error.response.status, error.response.statusText);
      console.log("\nResponse Body:");
      console.log(JSON.stringify(error.response.data, null, 2));
    } else {
      console.log("Error:", error.message);
    }
  }
}

testWithChisom();
