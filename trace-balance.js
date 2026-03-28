const { MongoClient } = require('mongodb');

const uri = "mongodb+srv://wispergroupcorporation_db_user:ybyCCo11YngpLY4N@appwisperng.ykxc7wz.mongodb.net/resellerAPI?retryWrites=true&w=majority&appName=AppWisperNg";

async function traceBalance() {
  const client = new MongoClient(uri);
  
  try {
    await client.connect();
    console.log("Connected to MongoDB\n");
    
    const database = client.db('resellerAPI');
    const monnifyHistories = database.collection('monnifyhistories');
    
    // Get all history in chronological order
    const history = await monnifyHistories.find({ 
      business_id: "69c2512a9b62425cb6ad4991" 
    }).sort({ createdAt: 1 }).toArray();
    
    console.log("=== Complete Transaction History (Chronological) ===\n");
    
    let runningBalance = 0;
    
    history.forEach((record, index) => {
      const isCredit = record.pay_type === 'credit';
      const amount = Number(record.amount);
      
      if (isCredit) {
        runningBalance += amount;
      } else {
        runningBalance -= amount;
      }
      
      console.log(`${index + 1}. ${record.createdAt}`);
      console.log(`   Type: ${record.pay_type.toUpperCase()}`);
      console.log(`   Purpose: ${record.purpose}`);
      console.log(`   Amount: ${isCredit ? '+' : '-'}₦${amount}`);
      console.log(`   Old Bal (recorded): ₦${record.old_bal}`);
      console.log(`   New Bal (recorded): ₦${record.new_bal}`);
      console.log(`   Running Balance (calculated): ₦${runningBalance}\n`);
    });
    
    console.log("=== Final Analysis ===");
    console.log(`Calculated Balance: ₦${runningBalance}`);
    console.log(`Last Recorded Balance: ₦${history[history.length - 1]?.new_bal || 0}`);
    
    // Check transactions collection for actual successful purchases
    const transactions = database.collection('transactions');
    const successfulTrx = await transactions.find({ 
      business_id: "69c2512a9b62425cb6ad4991",
      status: { $in: ['successful', 'completed'] }
    }).toArray();
    
    console.log(`\nSuccessful Transactions: ${successfulTrx.length}`);
    
    if (successfulTrx.length > 0) {
      let actualSpent = 0;
      successfulTrx.forEach(trx => {
        actualSpent += Number(trx.lite_volume);
        console.log(`  - ₦${trx.lite_volume} on ${trx.createdAt}`);
      });
      console.log(`\nActual Money Spent: ₦${actualSpent}`);
      console.log(`Correct Balance: ₦${3450 - actualSpent}`);
    } else {
      console.log("\n✅ No successful purchases - Balance should be ₦3,450");
    }
    
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await client.close();
  }
}

traceBalance();
