require('dotenv').config();
const mongoose = require('mongoose');

async function checkAllMTNPlans() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    
    console.log('=== ALL MTN PLANS ===\n');
    const mtnPlans = await mongoose.connection.db.collection('plans').find({ 
      network: 'mtn'
    }).sort({ plan_type: 1, volume: 1 }).toArray();
    
    const grouped = {};
    mtnPlans.forEach(plan => {
      if (!grouped[plan.plan_type]) {
        grouped[plan.plan_type] = [];
      }
      grouped[plan.plan_type].push(plan);
    });
    
    Object.keys(grouped).forEach(type => {
      console.log(`\n${type.toUpperCase()}:`);
      grouped[type].forEach(plan => {
        console.log(`  Plan ID: ${plan.plan_id} | ${plan.volume}${plan.unit} - ₦${plan.price}`);
      });
    });
    
    await mongoose.connection.close();
  } catch (error) {
    console.error('Error:', error.message);
  }
}

checkAllMTNPlans();
