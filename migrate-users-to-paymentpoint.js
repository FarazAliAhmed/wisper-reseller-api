#!/usr/bin/env node

/**
 * PaymentPoint Virtual Account Migration Script
 * 
 * This script migrates all existing users to PaymentPoint by creating virtual accounts
 * for users who don't already have one.
 * 
 * Usage:
 *   node migrate-users-to-paymentpoint.js           # Run migration
 *   node migrate-users-to-paymentpoint.js --dry-run # Test without creating accounts
 * 
 * Features:
 * - Connects to MongoDB using .env configuration
 * - Checks for existing PaymentPoint accounts
 * - Creates virtual accounts using PaymentPoint service
 * - Rate limiting (500ms delay between API calls)
 * - Comprehensive error handling
 * - Detailed console output with colors
 * - Log file generation
 * - Dry-run mode for testing
 */

require('dotenv').config();
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

// Import models and services
const { Account } = require('./src/models/account');
const paymentPointService = require('./src/services/paymentpoint.service');

// ANSI color codes for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
};

// Configuration
const DRY_RUN = process.argv.includes('--dry-run');
const DELAY_MS = 500; // Delay between API calls to avoid rate limiting
const LOG_FILE = path.join(__dirname, `migration-log-${Date.now()}.txt`);

// Migration statistics
const stats = {
  totalUsers: 0,
  alreadyMigrated: 0,
  successfullyMigrated: 0,
  failed: 0,
  skipped: 0,
  errors: [],
};

/**
 * Colored console log
 */
function log(message, color = 'white') {
  const timestamp = new Date().toISOString();
  const colorCode = colors[color] || colors.white;
  console.log(`${colorCode}[${timestamp}] ${message}${colors.reset}`);
  
  // Also write to log file
  fs.appendFileSync(LOG_FILE, `[${timestamp}] ${message}\n`);
}

/**
 * Log section header
 */
function logHeader(message) {
  const line = '='.repeat(80);
  log(line, 'cyan');
  log(message, 'cyan');
  log(line, 'cyan');
}

/**
 * Log error with details
 */
function logError(message, error, userId = null) {
  log(`❌ ERROR: ${message}`, 'red');
  if (error) {
    log(`   Details: ${error.message}`, 'red');
  }
  
  stats.errors.push({
    userId,
    message,
    error: error?.message || error,
    timestamp: new Date().toISOString(),
  });
}

/**
 * Sleep function for rate limiting
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Connect to MongoDB
 */
async function connectToDatabase() {
  try {
    const mongoUri = process.env.MONGODB_URI;
    
    if (!mongoUri) {
      throw new Error('MONGODB_URI not found in .env file');
    }

    log('Connecting to MongoDB...', 'blue');
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    log('✓ Connected to MongoDB successfully', 'green');
    return true;
  } catch (error) {
    logError('Failed to connect to MongoDB', error);
    return false;
  }
}

/**
 * Validate PaymentPoint configuration
 */
function validatePaymentPointConfig() {
  const apiKey = process.env.PAYMENTPOINT_API_KEY;
  const secretKey = process.env.PAYMENTPOINT_SECRET_KEY;
  
  if (!apiKey || !secretKey) {
    logError('PaymentPoint API credentials not found in .env file');
    return false;
  }
  
  log('✓ PaymentPoint configuration validated', 'green');
  return true;
}

/**
 * Check if user already has PaymentPoint account
 */
function hasPaymentPointAccount(user) {
  return !!(
    user.paymentpointAccountReference || 
    (user.paymentpointAccounts && user.paymentpointAccounts.length > 0)
  );
}

/**
 * Migrate a single user to PaymentPoint
 */
async function migrateUser(user) {
  const userId = user._id.toString();
  const userEmail = user.email;
  const userName = user.name || user.username;
  
  try {
    log(`\n📝 Processing user: ${userName} (${userEmail})`, 'blue');
    
    // Check if already has PaymentPoint account
    if (hasPaymentPointAccount(user)) {
      log(`   ⏭️  User already has PaymentPoint account - SKIPPED`, 'yellow');
      stats.alreadyMigrated++;
      return { success: true, skipped: true };
    }

    // Check for required fields
    if (!user.email) {
      log(`   ⚠️  User missing email - SKIPPED`, 'yellow');
      stats.skipped++;
      return { success: false, skipped: true, reason: 'Missing email' };
    }

    if (!user.name && !user.username) {
      log(`   ⚠️  User missing name/username - SKIPPED`, 'yellow');
      stats.skipped++;
      return { success: false, skipped: true, reason: 'Missing name' };
    }

    // Prepare account creation parameters
    const accountParams = {
      accountReference: userId,
      accountName: userName,
      customerEmail: userEmail,
      customerName: userName,
    };

    // Add BVN if available
    if (user.bvn && user.bvn.length === 11) {
      accountParams.bvn = user.bvn;
      log(`   ℹ️  BVN available: ${user.bvn.substring(0, 3)}********`, 'dim');
    }

    // Add NIN if available (and no BVN)
    if (!accountParams.bvn && user.nin && user.nin.length === 11) {
      accountParams.nin = user.nin;
      log(`   ℹ️  NIN available: ${user.nin.substring(0, 3)}********`, 'dim');
    }

    if (!accountParams.bvn && !accountParams.nin) {
      log(`   ℹ️  No BVN/NIN available (optional)`, 'dim');
    }

    // DRY RUN MODE - Don't actually create account
    if (DRY_RUN) {
      log(`   🔍 DRY RUN: Would create PaymentPoint account`, 'magenta');
      log(`      Account Reference: ${accountParams.accountReference}`, 'dim');
      log(`      Account Name: ${accountParams.accountName}`, 'dim');
      log(`      Email: ${accountParams.customerEmail}`, 'dim');
      stats.successfullyMigrated++;
      return { success: true, dryRun: true };
    }

    // Create PaymentPoint virtual account
    log(`   🔄 Creating PaymentPoint virtual account...`, 'blue');
    const result = await paymentPointService.createVirtualAccount(accountParams);

    if (result.success) {
      const accountData = result.data;
      const bankAccounts = accountData.accounts || [];
      
      log(`   ✅ SUCCESS: Virtual account created`, 'green');
      log(`      Account Reference: ${accountData.account_reference || userId}`, 'green');
      log(`      Bank Accounts: ${bankAccounts.length}`, 'green');
      
      // Log bank account details
      bankAccounts.forEach((account, index) => {
        log(`      Bank ${index + 1}: ${account.bank_name} - ${account.account_number}`, 'green');
      });

      stats.successfullyMigrated++;
      return { success: true, data: result };
    } else {
      throw new Error(result.message || 'Unknown error creating account');
    }

  } catch (error) {
    logError(`Failed to migrate user ${userName} (${userEmail})`, error, userId);
    stats.failed++;
    return { success: false, error: error.message };
  }
}

/**
 * Main migration function
 */
async function runMigration() {
  try {
    logHeader('PaymentPoint Virtual Account Migration Script');
    
    if (DRY_RUN) {
      log('🔍 RUNNING IN DRY-RUN MODE - No accounts will be created', 'magenta');
      log('', 'white');
    }

    log(`Log file: ${LOG_FILE}`, 'dim');
    log('', 'white');

    // Validate configuration
    if (!validatePaymentPointConfig()) {
      process.exit(1);
    }

    // Connect to database
    const connected = await connectToDatabase();
    if (!connected) {
      process.exit(1);
    }

    log('', 'white');
    logHeader('Fetching Users from Database');

    // Fetch all users
    const users = await Account.find({}).select(
      '_id name username email bvn nin paymentpointAccountReference paymentpointAccounts'
    );

    stats.totalUsers = users.length;
    log(`Found ${stats.totalUsers} users in database`, 'blue');
    log('', 'white');

    if (stats.totalUsers === 0) {
      log('No users found. Exiting.', 'yellow');
      await mongoose.connection.close();
      process.exit(0);
    }

    logHeader('Starting Migration Process');
    log(`Processing ${stats.totalUsers} users with ${DELAY_MS}ms delay between API calls`, 'blue');
    log('', 'white');

    // Process each user
    for (let i = 0; i < users.length; i++) {
      const user = users[i];
      log(`[${i + 1}/${users.length}]`, 'cyan');
      
      await migrateUser(user);

      // Rate limiting - delay between API calls
      if (i < users.length - 1 && !DRY_RUN) {
        await sleep(DELAY_MS);
      }
    }

    log('', 'white');
    logHeader('Migration Summary');

    // Print summary
    log(`Total Users:              ${stats.totalUsers}`, 'white');
    log(`Already Migrated:         ${stats.alreadyMigrated} (skipped)`, 'yellow');
    log(`Successfully Migrated:    ${stats.successfullyMigrated}`, 'green');
    log(`Failed:                   ${stats.failed}`, stats.failed > 0 ? 'red' : 'white');
    log(`Skipped (missing data):   ${stats.skipped}`, 'yellow');
    log('', 'white');

    // Print errors if any
    if (stats.errors.length > 0) {
      logHeader('Error Details');
      stats.errors.forEach((error, index) => {
        log(`${index + 1}. User ID: ${error.userId || 'N/A'}`, 'red');
        log(`   Message: ${error.message}`, 'red');
        log(`   Error: ${error.error}`, 'red');
        log('', 'white');
      });
    }

    // Generate summary report
    const summaryReport = {
      timestamp: new Date().toISOString(),
      dryRun: DRY_RUN,
      statistics: stats,
      configuration: {
        delayMs: DELAY_MS,
        mongoUri: process.env.MONGODB_URI ? '***configured***' : 'missing',
        paymentPointConfigured: !!(process.env.PAYMENTPOINT_API_KEY && process.env.PAYMENTPOINT_SECRET_KEY),
      },
    };

    const reportFile = path.join(__dirname, `migration-report-${Date.now()}.json`);
    fs.writeFileSync(reportFile, JSON.stringify(summaryReport, null, 2));
    log(`Summary report saved to: ${reportFile}`, 'cyan');

    log('', 'white');
    logHeader('Migration Complete');

    if (DRY_RUN) {
      log('🔍 This was a DRY RUN - no accounts were actually created', 'magenta');
      log('Run without --dry-run flag to perform actual migration', 'magenta');
    }

  } catch (error) {
    logError('Fatal error during migration', error);
    process.exit(1);
  } finally {
    // Close database connection
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.close();
      log('Database connection closed', 'dim');
    }
  }
}

// Run the migration
runMigration()
  .then(() => {
    log('Script execution completed', 'green');
    process.exit(0);
  })
  .catch((error) => {
    logError('Unhandled error', error);
    process.exit(1);
  });
