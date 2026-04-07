require('dotenv').config();
const mongoose = require('mongoose');

async function checkPlans() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
    
    // Get all collections
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('\nAvailable collections:');
    collections.forEach(c => console.log('  -', c.name));
    
    // Check for plans/dataplans collection
    const planCollections = collections.filter(c => 
      c.name.toLowerCase().includes('plan') || 
      c.name.toLowerCase().includes('data')
    );
    
    if (planCollections.length > 0) {
      console.log('\n=== PLAN COLLECTIONS ===');
      for (const col of planCollections) {
        console.log(`\n${col.name}:`);
        const data = await mongoose.connection.db.collection(col.name).find({}).limit(5).toArray();
        console.log(JSON.stringify(data, null, 2));
      }
    }
    
    // Check MTN plans specifically
    const mtnPlans = await mongoose.connection.db.collection('dataplans').find({ 
      network: { $regex: /mtn/i } 
    }).toArray();
    
    if (mtnPlans.length > 0) {
      console.log('\n=== MTN DATA PLANS ===');
      console.log(JSON.stringify(mtnPlans, null, 2));
    }
    
    await mongoose.connection.close();
  } catch (error) {
    console.error('Error:', error.message);
  }
}

checkPlans();
