require('dotenv').config();
const mongoose = require('mongoose');

async function getMTNPlans() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    
    const mtnPlans = await mongoose.connection.db.collection('plans').find({ 
      network: 'mtn'
    }).sort({ volume: 1 }).toArray();
    
    console.log('=== ALL MTN PLANS IN YOUR DATABASE ===\n');
    mtnPlans.forEach(plan => {
      console.log(`Plan ID: ${plan.plan_id}`);
      console.log(`  Size: ${plan.volume}${plan.unit}`);
      console.log(`  Price: ₦${plan.price}`);
      console.log(`  Type: ${plan.plan_type}`);
      console.log(`  Validity: ${plan.validity}`);
      console.log('');
    });
    
    console.log(`Total MTN Plans: ${mtnPlans.length}`);
    
    await mongoose.connection.close();
  } catch (error) {
    console.error('Error:', error.message);
  }
}

getMTNPlans();
