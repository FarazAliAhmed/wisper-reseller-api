#!/usr/bin/env node

/**
 * Test PaymentPoint API Direct Call
 * Shows the exact API response like Postman
 */

require("dotenv").config({ path: __dirname + "/.env" });
const axios = require("axios");

async function testPaymentPointAPI() {
  try {
    console.log("=== PAYMENTPOINT API TEST ===\n");

    const API_KEY = process.env.PAYMENTPOINT_API_KEY;
    const SECRET_KEY = process.env.PAYMENTPOINT_SECRET_KEY;
    const BASE_URL = process.env.PAYMENTPOINT_BASE_URL || "https://api.paymentpoint.co";

    console.log("Configuration:");
    console.log(`  Base URL: ${BASE_URL}`);
    console.log(`  API Key: ${API_KEY?.substring(0, 10)}...`);
    console.log(`  Secret Key: ${SECRET_KEY?.substring(0, 10)}...`);
    console.log("");

    // Test payload
    const payload = {
      email: "test@example.com",
      name: "Test User",
      phoneNumber: "09057790907",
      bankCode: ['20946', '20897'],
      businessId: "71e885f182ed5ea4454ef5e1d7e9a2ec40d1b36"
    };

    console.log("Request Payload:");
    console.log(JSON.stringify(payload, null, 2));
    console.log("");

    // Headers
    const headers = {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${SECRET_KEY}`,
      "api-key": API_KEY,
    };

    console.log("Request Headers:");
    console.log(JSON.stringify({
      "Content-Type": headers["Content-Type"],
      "Authorization": `Bearer ${SECRET_KEY?.substring(0, 20)}...`,
      "api-key": `${API_KEY?.substring(0, 20)}...`,
    }, null, 2));
    console.log("");

    const endpoint = `${BASE_URL}/api/v1/createVirtualAccount`;
    console.log(`Endpoint: POST ${endpoint}`);
    console.log("");

    console.log("Sending request...\n");

    // Make the API call
    const response = await axios.post(endpoint, payload, { headers });

    console.log("=== SUCCESS RESPONSE ===\n");
    console.log("Status Code:", response.status);
    console.log("Status Text:", response.statusText);
    console.log("");
    console.log("Response Headers:");
    console.log(JSON.stringify(response.headers, null, 2));
    console.log("");
    console.log("Response Body:");
    console.log(JSON.stringify(response.data, null, 2));

  } catch (error) {
    console.log("=== ERROR RESPONSE ===\n");

    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.log("Status Code:", error.response.status);
      console.log("Status Text:", error.response.statusText);
      console.log("");
      console.log("Response Headers:");
      console.log(JSON.stringify(error.response.headers, null, 2));
      console.log("");
      console.log("Response Body:");
      console.log(JSON.stringify(error.response.data, null, 2));
      console.log("");
      console.log("Error Message:", error.response.data?.message || error.response.data?.error || error.message);
    } else if (error.request) {
      // The request was made but no response was received
      console.log("No response received from server");
      console.log("Request:", error.request);
    } else {
      // Something happened in setting up the request that triggered an Error
      console.log("Error:", error.message);
    }

    console.log("");
    console.log("Full Error Object:");
    console.log(error);
  }
}

testPaymentPointAPI();
