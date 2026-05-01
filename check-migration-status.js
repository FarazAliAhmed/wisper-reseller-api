#!/usr/bin/env node

/**
 * PaymentPoint Migration Status Checker
 * 
 * This script checks the current status of PaymentPoint account migration
 * without making any changes to the database.
 * 
 * Usage:
 *   node check-migration-status.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const { Account } = require('./src/models/account');

// ANSI color codes
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
};

function log(message, color = 'white') {
  const colorCode = colors[color] || colors.white;
  console.log(`${colorCode}${message}${colors.reset}`);
}

function logHeader(message) {
  const line = '='.repeat(80);
  log(line, 'cyan');
  log(message, 'cyan');
  log(line, 'cyan');
}

async function checkMigrationStatus() {
  try {
    logHeader('PaymentPoint Migration Status Check');
    log('', 'white');

    // Connect to database
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      log('❌ MONGODB_URI not found in .env file', 'yellow');
      process.exit(1);
    }

    log('Connecting to MongoDB...', 'blue');
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    log('✓ Connected to MongoDB', 'green');
    log('', 'white');

    // Get total users
    const totalUsers = await Account.countDocuments({});
    log(`Total Users: ${totalUsers}`, 'white');

    // Get users with PaymentPoint accounts
    const usersWithPaymentPoint = await Account.countDocuments({
      paymentpointAccountReference: { $exists: true, $ne: null }
    });
    log(`Users with PaymentPoint: ${usersWithPaymentPoint}`, 'green');

    // Get users without PaymentPoint accounts
    const usersWithoutPaymentPoint = totalUsers - usersWithPaymentPoint;
    log(`Users without PaymentPoint: ${usersWithoutPaymentPoint}`, 'yellow');

    // Calculate percentage
    const percentage = totalUsers > 0 
      ? ((usersWithPaymentPoint / totalUsers) * 100).toFixed(2)
      : 0;
    log(`Migration Progress: ${percentage}%`, 'cyan');

    log('', 'white');
    logHeader('User Type Breakdown');

    // Breakdown by user type
    const userTypes = await Account.aggregate([
      {
        $group: {
          _id: '$type',
          total: { $sum: 1 },
          withPaymentPoint: {
            $sum: {
              $cond: [
                { $and: [
                  { $ne: ['$paymentpointAccountReference', null] },
                  { $ne: ['$paymentpointAccountReference', undefined] }
                ]},
                1,
                0
              ]
            }
          }
        }
      },
      { $sort: { total: -1 } }
    ]);

    userTypes.forEach(type => {
      const typePercentage = ((type.withPaymentPoint / type.total) * 100).toFixed(2);
      log(`${type._id || 'undefined'}: ${type.withPaymentPoint}/${type.total} (${typePercentage}%)`, 'white');
    });

    log('', 'white');
    logHeader('Users Missing Required Data');

    // Check for users missing email
    const missingEmail = await Account.countDocuments({
      $or: [
        { email: { $exists: false } },
        { email: null },
        { email: '' }
      ]
    });
    log(`Missing Email: ${missingEmail}`, missingEmail > 0 ? 'yellow' : 'green');

    // Check for users missing name
    const missingName = await Account.countDocuments({
      $and: [
        {
          $or: [
            { name: { $exists: false } },
            { name: null },
            { name: '' }
          ]
        },
        {
          $or: [
            { username: { $exists: false } },
            { username: null },
            { username: '' }
          ]
        }
      ]
    });
    log(`Missing Name/Username: ${missingName}`, missingName > 0 ? 'yellow' : 'green');

    // Check for users with BVN
    const withBVN = await Account.countDocuments({
      bvn: { $exists: true, $ne: null, $ne: '' }
    });
    log(`Users with BVN: ${withBVN}`, 'white');

    // Check for users with NIN
    const withNIN = await Account.countDocuments({
      nin: { $exists: true, $ne: null, $ne: '' }
    });
    log(`Users with NIN: ${withNIN}`, 'white');

    log('', 'white');
    logHeader('Sample Users Without PaymentPoint');

    // Show sample users without PaymentPoint
    const sampleUsers = await Account.find({
      $or: [
        { paymentpointAccountReference: { $exists: false } },
        { paymentpointAccountReference: null }
      ]
    })
    .select('_id name username email bvn nin')
    .limit(5);

    if (sampleUsers.length > 0) {
      sampleUsers.forEach((user, index) => {
        log(`${index + 1}. ${user.name || user.username} (${user.email})`, 'white');
        log(`   ID: ${user._id}`, 'white');
        log(`   BVN: ${user.bvn ? 'Yes' : 'No'} | NIN: ${user.nin ? 'Yes' : 'No'}`, 'white');
      });
    } else {
      log('✓ All users have PaymentPoint accounts!', 'green');
    }

    log('', 'white');
    logHeader('Recommendations');

    if (usersWithoutPaymentPoint === 0) {
      log('✅ Migration is complete! All users have PaymentPoint accounts.', 'green');
    } else if (usersWithoutPaymentPoint > 0) {
      log(`⚠️  ${usersWithoutPaymentPoint} users still need PaymentPoint accounts.`, 'yellow');
      log('', 'white');
      log('Next steps:', 'cyan');
      log('1. Run dry-run: node migrate-users-to-paymentpoint.js --dry-run', 'white');
      log('2. Review the output', 'white');
      log('3. Run migration: node migrate-users-to-paymentpoint.js', 'white');
    }

    if (missingEmail > 0 || missingName > 0) {
      log('', 'white');
      log(`⚠️  ${missingEmail + missingName} users have missing required data.`, 'yellow');
      log('These users will be skipped during migration.', 'white');
    }

    log('', 'white');

  } catch (error) {
    log(`❌ Error: ${error.message}`, 'yellow');
    console.error(error);
    process.exit(1);
  } finally {
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.close();
    }
  }
}

// Run the status check
checkMigrationStatus()
  .then(() => {
    log('Status check completed', 'green');
    process.exit(0);
  })
  .catch((error) => {
    log(`Fatal error: ${error.message}`, 'yellow');
    process.exit(1);
  });
