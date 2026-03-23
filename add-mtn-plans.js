/**
 * Script to Add MTN Data Transfer Plans to Database
 * 
 * Run: node add-mtn-plans.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const Plan = require('./src/models/plan');

// MongoDB connection string - update if needed
const MONGODB_URI = process.env.MONGODB_URI || process.env.DATABASE_URL || 'mongodb://localhost:27017/wisper';

// MTN Data Transfer Plans
const mtnDataTransferPlans = [
  // Monthly Plans (30 days)
  { plan_id: 2001, network: "mtn", plan_type: "data_transfer", price: 50, volume: 50, unit: "mb", validity: "30 days" },
  { plan_id: 2002, network: "mtn", plan_type: "data_transfer", price: 100, volume: 100, unit: "mb", validity: "30 days" },
  { plan_id: 2003, network: "mtn", plan_type: "data_transfer", price: 135, volume: 200, unit: "mb", validity: "30 days" },
  { plan_id: 2004, network: "mtn", plan_type: "data_transfer", price: 135, volume: 500, unit: "mb", validity: "30 days" },
  { plan_id: 2005, network: "mtn", plan_type: "data_transfer", price: 270, volume: 1, unit: "gb", validity: "30 days" },
  { plan_id: 2006, network: "mtn", plan_type: "data_transfer", price: 540, volume: 2, unit: "gb", validity: "30 days" },
  { plan_id: 2007, network: "mtn", plan_type: "data_transfer", price: 810, volume: 3, unit: "gb", validity: "30 days" },
  { plan_id: 2008, network: "mtn", plan_type: "data_transfer", price: 1350, volume: 5, unit: "gb", validity: "30 days" },
  
  // Weekly Plans (7 days)
  { plan_id: 2009, network: "mtn", plan_type: "data_transfer", price: 100, volume: 500, unit: "mb", validity: "7 days" },
  { plan_id: 2010, network: "mtn", plan_type: "data_transfer", price: 200, volume: 1, unit: "gb", validity: "7 days" },
  { plan_id: 2011, network: "mtn", plan_type: "data_transfer", price: 400, volume: 2, unit: "gb", validity: "7 days" },
  { plan_id: 2012, network: "mtn", plan_type: "data_transfer", price: 600, volume: 3, unit: "gb", validity: "7 days" },
  { plan_id: 2013, network: "mtn", plan_type: "data_transfer", price: 1000, volume: 5, unit: "gb", validity: "7 days" },
];

async function addMTNPlans() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB\n');

    console.log('🔍 Checking for existing MTN Data Transfer plans...');
    const existingPlans = await Plan.find({ 
      network: "mtn", 
      plan_type: "data_transfer" 
    });
    
    if (existingPlans.length > 0) {
      console.log(`⚠️  Found ${existingPlans.length} existing MTN Data Transfer plans`);
      console.log('   Plan IDs:', existingPlans.map(p => p.plan_id).join(', '));
      console.log('\n❓ Do you want to:');
      console.log('   1. Skip adding (keep existing plans)');
      console.log('   2. Delete existing and add new plans');
      console.log('\n   To delete and re-add, run: node add-mtn-plans.js --force');
      
      if (!process.argv.includes('--force')) {
        console.log('\n✋ Skipping... Use --force flag to override');
        process.exit(0);
      }
      
      console.log('\n🗑️  Deleting existing MTN Data Transfer plans...');
      await Plan.deleteMany({ network: "mtn", plan_type: "data_transfer" });
      console.log('✅ Deleted existing plans\n');
    }

    console.log('📝 Adding MTN Data Transfer plans...\n');
    
    let successCount = 0;
    let errorCount = 0;

    for (const planData of mtnDataTransferPlans) {
      try {
        const plan = new Plan(planData);
        await plan.save();
        console.log(`✅ Added: ${planData.volume}${planData.unit.toUpperCase()} (${planData.validity}) - ₦${planData.price} [ID: ${planData.plan_id}]`);
        successCount++;
      } catch (error) {
        console.log(`❌ Failed: ${planData.volume}${planData.unit.toUpperCase()} - ${error.message}`);
        errorCount++;
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log(`✅ Successfully added: ${successCount} plans`);
    if (errorCount > 0) {
      console.log(`❌ Failed: ${errorCount} plans`);
    }
    console.log('='.repeat(60));

    console.log('\n📊 Verifying plans in database...');
    const allMTNPlans = await Plan.find({ network: "mtn" }).sort({ plan_id: 1 });
    console.log(`\nTotal MTN plans in database: ${allMTNPlans.length}`);
    console.log('Plan types:', [...new Set(allMTNPlans.map(p => p.plan_type))].join(', '));

    console.log('\n🎉 Done! MTN Data Transfer plans are now available in your database.');
    console.log('\n📝 Next steps:');
    console.log('   1. Restart your API server');
    console.log('   2. Login to your dashboard');
    console.log('   3. Go to /packages to see the plans');
    console.log('   4. Go to /allocate to buy data');

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error('\n💡 Troubleshooting:');
    console.error('   1. Check your MongoDB connection string in .env');
    console.error('   2. Make sure MongoDB is running');
    console.error('   3. Check if you have the correct database name');
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

// Run the script
console.log('🚀 MTN Data Transfer Plans Setup Script\n');
addMTNPlans();
