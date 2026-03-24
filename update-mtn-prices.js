/**
 * Script to Update MTN Data Transfer Plan Prices
 * 
 * Client's requested prices:
 * 500MB - ₦250
 * 1GB - ₦420
 * 2GB - ₦820
 * 3GB - ₦1,230
 * 5GB - ₦2,050
 * 10GB - ₦4,100
 * 
 * Run: node update-mtn-prices.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const Plan = require('./src/models/plan');

// MongoDB connection string
const MONGODB_URI = process.env.MONGODB_URI || process.env.DATABASE_URL;

// New prices as requested by client
const priceUpdates = [
  { volume: 500, unit: 'mb', newPrice: 250 },
  { volume: 1, unit: 'gb', newPrice: 420 },
  { volume: 2, unit: 'gb', newPrice: 820 },
  { volume: 3, unit: 'gb', newPrice: 1230 },
  { volume: 5, unit: 'gb', newPrice: 2050 },
  { volume: 10, unit: 'gb', newPrice: 4100 },
];

async function updatePrices() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB\n');

    console.log('📊 Current MTN Data Transfer Plans:\n');
    
    // Show current plans
    const currentPlans = await Plan.find({ 
      network: 'mtn', 
      plan_type: 'data_transfer' 
    }).sort({ volume: 1, unit: 1 });
    
    currentPlans.forEach(plan => {
      console.log(`   ${plan.volume}${plan.unit.toUpperCase()} - Current: ₦${plan.price} [ID: ${plan.plan_id}]`);
    });

    console.log('\n' + '='.repeat(60));
    console.log('🔄 Updating Prices...\n');

    let updatedCount = 0;
    let notFoundCount = 0;

    for (const update of priceUpdates) {
      const plan = await Plan.findOne({
        network: 'mtn',
        plan_type: 'data_transfer',
        volume: update.volume,
        unit: update.unit,
        validity: '30 days' // Only update monthly plans
      });

      if (plan) {
        const oldPrice = plan.price;
        plan.price = update.newPrice;
        await plan.save();
        
        console.log(`✅ Updated: ${update.volume}${update.unit.toUpperCase()} - ₦${oldPrice} → ₦${update.newPrice}`);
        updatedCount++;
      } else {
        console.log(`⚠️  Not found: ${update.volume}${update.unit.toUpperCase()} (30 days)`);
        notFoundCount++;
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log(`✅ Successfully updated: ${updatedCount} plans`);
    if (notFoundCount > 0) {
      console.log(`⚠️  Not found: ${notFoundCount} plans`);
    }
    console.log('='.repeat(60));

    console.log('\n📊 Updated MTN Data Transfer Plans:\n');
    
    // Show updated plans
    const updatedPlans = await Plan.find({ 
      network: 'mtn', 
      plan_type: 'data_transfer',
      validity: '30 days'
    }).sort({ volume: 1, unit: 1 });
    
    updatedPlans.forEach(plan => {
      console.log(`   ${plan.volume}${plan.unit.toUpperCase()} (${plan.validity}) - ₦${plan.price} [ID: ${plan.plan_id}]`);
    });

    console.log('\n🎉 Price update complete!');
    console.log('\n📝 Next steps:');
    console.log('   1. Prices are now updated in database');
    console.log('   2. Restart your API server (if running locally)');
    console.log('   3. Customers will see new prices immediately');
    console.log('   4. Test a purchase to verify');

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error('\n💡 Troubleshooting:');
    console.error('   1. Check your MongoDB connection string in .env');
    console.error('   2. Make sure MongoDB is accessible');
    console.error('   3. Verify the database name is correct');
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

// Run the script
console.log('🚀 MTN Data Transfer Price Update Script\n');
console.log('Client requested prices:');
console.log('   500MB - ₦250');
console.log('   1GB - ₦420');
console.log('   2GB - ₦820');
console.log('   3GB - ₦1,230');
console.log('   5GB - ₦2,050');
console.log('   10GB - ₦4,100\n');

updatePrices();
