/**
 * Update MTN GIFTING Plan Prices
 * 
 * Client wants new prices under MTN GIFTING (not MTN SME or data_transfer)
 * 
 * New prices:
 * 500MB - ₦250
 * 1GB - ₦420
 * 2GB - ₦820
 * 3GB - ₦1,230
 * 5GB - ₦2,050
 * 10GB - ₦4,100
 */

require('dotenv').config();
const mongoose = require('mongoose');
const Plan = require('./src/models/plan');

const MONGODB_URI = process.env.MONGODB_URI || process.env.DATABASE_URL;

const priceUpdates = [
  { plan_id: 210, newPrice: 250 },  // 500MB
  { plan_id: 52, newPrice: 420 },   // 1GB
  { plan_id: 51, newPrice: 820 },   // 2GB
  { plan_id: 43, newPrice: 1230 },  // 3GB
  { plan_id: 50, newPrice: 2050 },  // 5GB
  { plan_id: 206, newPrice: 4100 }, // 10GB
];

async function updatePrices() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB\n');

    console.log('📊 Current MTN GIFTING Plans:\n');
    
    const currentPlans = await Plan.find({ 
      network: 'mtn', 
      plan_type: 'gifting' 
    }).sort({ volume: 1, unit: 1 });
    
    currentPlans.forEach(plan => {
      console.log(`   [${plan.plan_id}] ${plan.volume}${plan.unit.toUpperCase()} - ₦${plan.price}`);
    });

    console.log('\n' + '='.repeat(60));
    console.log('🔄 Updating MTN GIFTING Prices...\n');

    let updatedCount = 0;

    for (const update of priceUpdates) {
      const plan = await Plan.findOne({ plan_id: update.plan_id });

      if (plan) {
        const oldPrice = plan.price;
        plan.price = update.newPrice;
        await plan.save();
        
        console.log(`✅ [${update.plan_id}] ${plan.volume}${plan.unit.toUpperCase()} - ₦${oldPrice} → ₦${update.newPrice}`);
        updatedCount++;
      } else {
        console.log(`⚠️  Plan ID ${update.plan_id} not found`);
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log(`✅ Successfully updated: ${updatedCount} MTN GIFTING plans`);
    console.log('='.repeat(60));

    console.log('\n📊 Updated MTN GIFTING Plans:\n');
    
    const updatedPlans = await Plan.find({ 
      network: 'mtn', 
      plan_type: 'gifting' 
    }).sort({ volume: 1, unit: 1 });
    
    updatedPlans.forEach(plan => {
      console.log(`   [${plan.plan_id}] ${plan.volume}${plan.unit.toUpperCase()} - ₦${plan.price}`);
    });

    console.log('\n🎉 MTN GIFTING prices updated successfully!');

  } catch (error) {
    console.error('\n❌ Error:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

console.log('🚀 Update MTN GIFTING Prices\n');
updatePrices();
