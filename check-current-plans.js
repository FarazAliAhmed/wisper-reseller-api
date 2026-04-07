require('dotenv').config();
const mongoose = require('mongoose');

async function checkCurrentPlans() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    
    console.log('=== CURRENT MTN GIFTING PLANS ===\n');
    const mtnPlans = await mongoose.connection.db.collection('plans').find({ 
      network: 'mtn',
      plan_type: 'gifting'
    }).sort({ volume: 1 }).toArray();
    
    mtnPlans.forEach(plan => {
      console.log(`Plan ID: ${plan.plan_id} | ${plan.volume}${plan.unit} - ₦${plan.price} | Type: ${plan.plan_type}`);
    });
    
    console.log('\n=== CURRENT GLO GIFTING PLANS ===\n');
    const gloPlans = await mongoose.connection.db.collection('plans').find({ 
      network: 'glo',
      plan_type: 'gifting'
    }).sort({ volume: 1 }).toArray();
    
    if (gloPlans.length > 0) {
      gloPlans.forEach(plan => {
        console.log(`Plan ID: ${plan.plan_id} | ${plan.volume}${plan.unit} - ₦${plan.price} | Type: ${plan.plan_type}`);
      });
    } else {
      console.log('No GLO gifting plans found');
    }
    
    await mongoose.connection.close();
  } catch (error) {
    console.error('Error:', error.message);
  }
}

checkCurrentPlans();
