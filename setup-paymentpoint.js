#!/usr/bin/env node

/**
 * PaymentPoint Setup Script
 * Run this script to verify PaymentPoint integration setup
 * 
 * Usage: node setup-paymentpoint.js
 */

require("dotenv").config({ path: __dirname + "/.env" });
const mongoose = require("mongoose");

const colors = {
  reset: "\x1b[0m",
  green: "\x1b[32m",
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function checkEnvVariable(name) {
  const value = process.env[name];
  if (!value || value === "your_api_key_here" || value === "your_secret_key_here") {
    log(`✗ ${name} is not configured`, colors.red);
    return false;
  }
  log(`✓ ${name} is configured`, colors.green);
  return true;
}

async function checkDatabase() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    log("✓ Database connection successful", colors.green);
    
    // Check if PaymentPointHistory model exists
    const collections = await mongoose.connection.db.listCollections().toArray();
    const hasCollection = collections.some(c => c.name === "paymentpointhistories");
    
    if (hasCollection) {
      log("✓ PaymentPointHistory collection exists", colors.green);
    } else {
      log("ℹ PaymentPointHistory collection will be created on first use", colors.yellow);
    }
    
    await mongoose.connection.close();
    return true;
  } catch (error) {
    log(`✗ Database connection failed: ${error.message}`, colors.red);
    return false;
  }
}

async function main() {
  log("\n=== PaymentPoint Integration Setup Check ===\n", colors.blue);

  let allGood = true;

  // Check environment variables
  log("Checking environment variables...", colors.blue);
  allGood = checkEnvVariable("PAYMENTPOINT_BASE_URL") && allGood;
  allGood = checkEnvVariable("PAYMENTPOINT_API_KEY") && allGood;
  allGood = checkEnvVariable("PAYMENTPOINT_SECRET_KEY") && allGood;
  allGood = checkEnvVariable("MONGODB_URI") && allGood;

  console.log();

  // Check database
  log("Checking database connection...", colors.blue);
  const dbOk = await checkDatabase();
  allGood = dbOk && allGood;

  console.log();

  // Check files
  log("Checking integration files...", colors.blue);
  const fs = require("fs");
  const files = [
    "src/services/paymentpoint.service.js",
    "src/routes/paymentpoint.route.js",
    "src/models/paymentpointHistory.js",
  ];

  files.forEach(file => {
    if (fs.existsSync(file)) {
      log(`✓ ${file} exists`, colors.green);
    } else {
      log(`✗ ${file} is missing`, colors.red);
      allGood = false;
    }
  });

  console.log();

  // Summary
  if (allGood) {
    log("=== ✓ Setup Complete! ===", colors.green);
    log("\nNext steps:", colors.blue);
    log("1. Configure webhook URL on PaymentPoint dashboard");
    log("2. Test account creation: POST /api/paymentpoint/create-account");
    log("3. Test webhook: POST /api/paymentpoint/webhook");
    log("\nSee PAYMENTPOINT_INTEGRATION_GUIDE.md for detailed instructions.");
  } else {
    log("=== ✗ Setup Incomplete ===", colors.red);
    log("\nPlease fix the issues above and run this script again.", colors.yellow);
    log("See PAYMENTPOINT_INTEGRATION_GUIDE.md for help.");
  }

  console.log();
  process.exit(allGood ? 0 : 1);
}

main().catch(error => {
  log(`\nFatal error: ${error.message}`, colors.red);
  process.exit(1);
});
