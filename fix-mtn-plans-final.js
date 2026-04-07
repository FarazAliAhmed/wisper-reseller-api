require('dotenv').config();
const mongoose = require('mongoose');

async function fixMTNPlans() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    
    console.log('=== REMOVING MTN DATA_TRANSFER (SME) PLANS ===\n');
    const deleteResult = await mongoose.connection.db.collection('plans').deleteMany({ 
      network: 'mtn',
      plan_type: 'data_transfer'
    });
    console.log(`✅ Deleted ${deleteResult.deletedCount} MTN SME plans`);
    
    console.log('\n=== FINAL MTN DIRECT PLANS ===\n');
    const mtnPlans = await mongoose.connection.db.collection('plans').find({ 
      network: 'mtn',
      plan_type: 'direct'
    }).sort({ volume: 1 }).toArray();
    
    mtnPlans.forEach(plan => {
      console.log(`${plan.volume}${plan.unit} - ₦${plan.price} (Plan ID: ${plan.plan_id})`);
    });
    
    console.log('\n=== FINAL GLO GIFTING PLANS ===\n');
    const gloPlans = await mongoose.connection.db.collection('plans').find({ 
      network: 'glo',
      plan_type: 'gifting',
      plan_id: { $in: [703, 704, 705, 706, 707] }
    }).sort({ volume: 1 }).toArray();
    
    gloPlans.forEach(plan => {
      console.log(`${plan.volume}${plan.unit} - ₦${plan.price} (Plan ID: ${plan.plan_id})`);
    });
    
    await mongoose.connection.close();
    console.log('\n✅ ALL DONE!');
  } catch (error) {
    console.error('Error:', error.message);
  }
}

fixMTNPlans();
