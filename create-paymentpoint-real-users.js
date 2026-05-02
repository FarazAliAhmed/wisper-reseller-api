#!/usr/bin/env node

require('dotenv').config();
const mongoose = require('mongoose');
const { Account } = require('./src/models/account');
const paymentPointService = require('./src/services/paymentpoint.service');

// ANSI color codes
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// Valid Nigerian phone number patterns
function isValidNigerianPhone(phone) {
  if (!phone) return false;
  
  const phoneStr = String(phone).replace(/\D/g, ''); // Remove non-digits
  
  // Nigerian numbers: 11 digits starting with 0, or 10 digits without 0
  // Valid prefixes: 070, 080, 081, 090, 091, etc.
  if (phoneStr.length === 11 && phoneStr.startsWith('0')) {
    const prefix = phoneStr.substring(0, 4);
    const validPrefixes = ['0701', '0702', '0703', '0704', '0705', '0706', '0707', '0708', '0709',
                          '0801', '0802', '0803', '0804', '0805', '0806', '0807', '0808', '0809',
                          '0810', '0811', '0812', '0813', '0814', '0815', '0816', '0817', '0818',
                          '0901', '0902', '0903', '0904', '0905', '0906', '0907', '0908', '0909',
                          '0910', '0911', '0912', '0913', '0914', '0915', '0916', '0917', '0918'];
    return validPrefixes.some(p => phoneStr.startsWith(p));
  }
  
  return false;
}

async function createPaymentPointAccounts() {
  try {
    log('='.repeat(80), 'cyan');
    log('Create PaymentPoint Accounts for Real Users', 'cyan');
    log('='.repeat(80), 'cyan');

    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      throw new Error('MONGODB_URI not found in .env file');
    }

    log('\nConnecting to MongoDB...', 'blue');
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    log('✓ Connected to MongoDB\n', 'green');

    // Fetch all users
    const users = await Account.find({})
      .select('_id name username email mobile_number phone paymentpointAccountReference paymentpointAccounts')
      .exec();

    log(`Found ${users.length} total users\n`, 'blue');

    // Filter users with valid phone numbers
    const validUsers = users.filter(user => {
      const phone = user.mobile_number || user.phone;
      return isValidNigerianPhone(phone);
    });

    log(`Users with valid Nigerian phone numbers: ${validUsers.length}\n`, 'green');
    log('='.repeat(80), 'cyan');

    if (validUsers.length === 0) {
      log('\nNo users with valid phone numbers found.', 'yellow');
      await mongoose.connection.close();
      process.exit(0);
    }

    // Display users
    log('\nUsers to process:\n', 'cyan');
    validUsers.forEach((user, index) => {
      const phone = user.mobile_number || user.phone;
      const hasAccount = !!(user.paymentpointAccountReference || 
                           (user.paymentpointAccounts && user.paymentpointAccounts.length > 0));
      
      log(`${index + 1}. ${user.name} (${user.email})`, 'white');
      log(`   Phone: ${phone}`, 'white');
      log(`   PaymentPoint Account: ${hasAccount ? 'YES ✓' : 'NO ✗'}`, hasAccount ? 'green' : 'yellow');
      console.log('');
    });

    log('='.repeat(80), 'cyan');
    log('\nStarting account creation...\n', 'blue');

    let created = 0;
    let skipped = 0;
    let failed = 0;

    for (let i = 0; i < validUsers.length; i++) {
      const user = validUsers[i];
      const phone = user.mobile_number || user.phone;
      
      log(`\n[${i + 1}/${validUsers.length}] Processing: ${user.name} (${user.email})`, 'cyan');
      
      // Check if already has account
      if (user.paymentpointAccountReference || 
          (user.paymentpointAccounts && user.paymentpointAccounts.length > 0)) {
        log('   ⏭️  Already has PaymentPoint account - SKIPPED', 'yellow');
        skipped++;
        continue;
      }

      try {
        log('   🔄 Creating PaymentPoint account...', 'blue');
        
        const result = await paymentPointService.createVirtualAccount({
          accountReference: user._id.toString(),
          accountName: user.name,
          customerEmail: user.email,
          customerName: user.name,
        });

        if (result.success) {
          log('   ✅ SUCCESS! Account created', 'green');
          
          if (result.data.bankAccounts) {
            result.data.bankAccounts.forEach(account => {
              log(`      ${account.bankName}: ${account.accountNumber}`, 'green');
            });
          }
          
          created++;
        } else {
          log(`   ❌ FAILED: ${result.message}`, 'red');
          failed++;
        }

        // Rate limiting - wait 500ms between requests
        if (i < validUsers.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 500));
        }

      } catch (error) {
        log(`   ❌ ERROR: ${error.message}`, 'red');
        failed++;
      }
    }

    log('\n' + '='.repeat(80), 'cyan');
    log('Summary', 'cyan');
    log('='.repeat(80), 'cyan');
    log(`Total Users Processed: ${validUsers.length}`, 'white');
    log(`Successfully Created: ${created}`, 'green');
    log(`Already Had Account: ${skipped}`, 'yellow');
    log(`Failed: ${failed}`, failed > 0 ? 'red' : 'white');
    log('='.repeat(80), 'cyan');

    // Close connection
    await mongoose.connection.close();
    log('\nDatabase connection closed', 'blue');
    process.exit(0);

  } catch (error) {
    log(`\n❌ Fatal Error: ${error.message}`, 'red');
    console.error(error);
    process.exit(1);
  }
}

createPaymentPointAccounts();
