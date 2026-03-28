const { MongoClient } = require('mongodb');

const uri = "mongodb+srv://wispergroupcorporation_db_user:ybyCCo11YngpLY4N@appwisperng.ykxc7wz.mongodb.net/resellerAPI?retryWrites=true&w=majority&appName=AppWisperNg";

async function checkActualCredit() {
  const client = new MongoClient(uri);
  
  try {
    await client.connect();
    console.log("Connected to MongoDB\n");
    
    const database = client.db('resellerAPI');
    const monnifyHistories = database.collection('monnifyhistories');
    
    // Get the funding transaction
    const funding = await monnifyHistories.findOne({ 
      business_id: "69c2512a9b62425cb6ad4991",
      purpose: "Funding - Monnify"
    });
    
    if (funding) {
      console.log("=== Monnify Funding Transaction ===\n");
      console.log(`Amount Paid: ₦${funding.amount}`);
      console.log(`Resolved Amount: ₦${funding.resolvedAmount}`);
      console.log(`Old Balance: ₦${funding.old_bal}`);
      console.log(`New Balance: ₦${funding.new_bal}`);
      console.log(`Purpose: ${funding.purpose}`);
      console.log(`Date: ${funding.date_of_payment}`);
      console.log(`Reference: ${funding.payment_ref}`);
      
      console.log(`\n💰 Actual Amount Credited: ₦${funding.amount}`);
      console.log(`📝 This is what should be in the balance`);
    } else {
      console.log("No funding transaction found");
    }
    
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await client.close();
  }
}

checkActualCredit();
