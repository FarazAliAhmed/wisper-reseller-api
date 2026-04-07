require('dotenv').config();
const mongoose = require('mongoose');

async function verifyPrices() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    
    console.log('=== VERIFYING MTN DIRECT PRICES ===\n');
    console.log('Client requested:');
    console.log('500MB - ₦500');
    console.log('1GB - ₦800');
    console.log('2GB - ₦1,500');
    console.log('3GB - ₦2,500');
    console.log('5GB - ₦3,500');
    console.log('10GB - ₦4,500');
    
    console.log('\nCurrent in database:');
    const mtnPlans = await mongoose.connection.db.collection('plans').find({ 
      network: 'mtn',
      plan_type: 'direct',
      plan_id: { $in: [210, 52, 51, 43, 50, 206] }
    }).sort({ volume: 1 }).toArray();
    
    const expected = {
      '500mb': 500,
      '1gb': 800,
      '2gb': 1500,
      '3gb': 2500,
      '5gb': 3500,
      '10gb': 4500
    };
    
    let allCorrect = true;
    mtnPlans.forEach(plan => {
      const key = `${plan.volume}${plan.unit}`;
      const expectedPrice = expected[key];
      const match = plan.price === expectedPrice ? '✅' : '❌';
      console.log(`${match} ${plan.volume}${plan.unit} - ₦${plan.price} ${plan.price !== expectedPrice ? `(should be ₦${expectedPrice})` : ''}`);
      if (plan.price !== expectedPrice) allCorrect = false;
    });
    
    console.log('\n=== VERIFYING GLO GIFTING PRICES ===\n');
    console.log('Client requested:');
    console.log('1GB - ₦400');
    console.log('2GB - ₦800');
    console.log('3GB - ₦1,200');
    console.log('5GB - ₦2,000');
    console.log('10GB - ₦4,000');
    
    console.log('\nCurrent in database:');
    const gloPlans = await mongoose.connection.db.collection('plans').find({ 
      network: 'glo',
      plan_type: 'gifting',
      plan_id: { $in: [703, 704, 705, 706, 707] }
    }).sort({ volume: 1 }).toArray();
    
    const expectedGlo = {
      '1gb': 400,
      '2gb': 800,
      '3gb': 1200,
      '5gb': 2000,
      '10gb': 4000
    };
    
    gloPlans.forEach(plan => {
      const key = `${plan.volume}${plan.unit}`;
      const expectedPrice = expectedGlo[key];
      const match = plan.price === expectedPrice ? '✅' : '❌';
      console.log(`${match} ${plan.volume}${plan.unit} - ₦${plan.price} ${plan.price !== expectedPrice ? `(should be ₦${expectedPrice})` : ''}`);
      if (plan.price !== expectedPrice) allCorrect = false;
    });
    
    console.log('\n' + (allCorrect ? '✅ ALL PRICES ARE CORRECT!' : '❌ SOME PRICES NEED FIXING'));
    
    await mongoose.connection.close();
  } catch (error) {
    console.error('Error:', error.message);
  }
}

verifyPrices();
