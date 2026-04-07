require('dotenv').config();
const mongoose = require('mongoose');

async function updatePlans() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    
    console.log('=== UPDATING MTN GIFTING PLANS ===\n');
    
    // Change plan_type from 'gifting' to 'direct' for MTN
    const mtnUpdate = await mongoose.connection.db.collection('plans').updateMany(
      { network: 'mtn', plan_type: 'gifting' },
      { $set: { plan_type: 'direct' } }
    );
    console.log(`✅ Changed ${mtnUpdate.modifiedCount} MTN plans from 'gifting' to 'direct'`);
    
    // Update MTN prices
    const updates = [
      { plan_id: 210, price: 500 },  // 500MB
      { plan_id: 52, price: 800 },   // 1GB
      { plan_id: 51, price: 1500 },  // 2GB
      { plan_id: 43, price: 2500 },  // 3GB
      { plan_id: 50, price: 3500 },  // 5GB
      { plan_id: 206, price: 4500 }  // 10GB
    ];
    
    for (const update of updates) {
      const result = await mongoose.connection.db.collection('plans').updateOne(
        { plan_id: update.plan_id, network: 'mtn' },
        { $set: { price: update.price } }
      );
      const plan = await mongoose.connection.db.collection('plans').findOne({ plan_id: update.plan_id });
      console.log(`✅ Updated Plan ${update.plan_id}: ${plan.volume}${plan.unit} - ₦${update.price}`);
    }
    
    console.log('\n=== UPDATING GLO GIFTING PLANS ===\n');
    
    // Update GLO prices
    const gloUpdates = [
      { plan_id: 703, price: 400 },   // 1GB
      { plan_id: 704, price: 800 },   // 2GB
      { plan_id: 705, price: 1200 },  // 3GB
      { plan_id: 706, price: 2000 },  // 5GB
      { plan_id: 707, price: 4000 }   // 10GB
    ];
    
    for (const update of gloUpdates) {
      const result = await mongoose.connection.db.collection('plans').updateOne(
        { plan_id: update.plan_id, network: 'glo' },
        { $set: { price: update.price } }
      );
      const plan = await mongoose.connection.db.collection('plans').findOne({ plan_id: update.plan_id });
      console.log(`✅ Updated Plan ${update.plan_id}: ${plan.volume}${plan.unit} - ₦${update.price}`);
    }
    
    console.log('\n=== FINAL PLANS ===\n');
    
    console.log('MTN Direct Plans:');
    const mtnFinal = await mongoose.connection.db.collection('plans').find({ 
      network: 'mtn',
      plan_type: 'direct',
      plan_id: { $in: [210, 52, 51, 43, 50, 206] }
    }).sort({ volume: 1 }).toArray();
    
    mtnFinal.forEach(plan => {
      console.log(`  ${plan.volume}${plan.unit} - ₦${plan.price} (Plan ID: ${plan.plan_id})`);
    });
    
    console.log('\nGLO Corporate Gifting Plans:');
    const gloFinal = await mongoose.connection.db.collection('plans').find({ 
      network: 'glo',
      plan_type: 'gifting',
      plan_id: { $in: [703, 704, 705, 706, 707] }
    }).sort({ volume: 1 }).toArray();
    
    gloFinal.forEach(plan => {
      console.log(`  ${plan.volume}${plan.unit} - ₦${plan.price} (Plan ID: ${plan.plan_id})`);
    });
    
    await mongoose.connection.close();
    console.log('\n✅ ALL UPDATES COMPLETE');
  } catch (error) {
    console.error('Error:', error.message);
  }
}

updatePlans();
