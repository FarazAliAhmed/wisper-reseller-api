const { MongoClient } = require('mongodb');

const uri = "mongodb+srv://wispergroupcorporation_db_user:ybyCCo11YngpLY4N@appwisperng.ykxc7wz.mongodb.net/resellerAPI?retryWrites=true&w=majority&appName=AppWisperNg";

async function manualUpdateBankAccounts() {
  const client = new MongoClient(uri, {
    serverSelectionTimeoutMS: 30000,
    socketTimeoutMS: 30000,
  });
  
  try {
    await client.connect();
    console.log("Connected to MongoDB\n");
    
    const database = client.db('resellerAPI');
    const accounts = database.collection('accounts');
    
    // Manually add the Moniepoint account that was created
    const bankAccounts = [
      {
        bankName: "Moniepoint Microfinance Bank",
        accountNumber: "PENDING", // We need to get this from Monnify
        accountName: "Octasub"
      }
    ];
    
    console.log("Updating bank accounts for macalaoma12@gmail.com...\n");
    
    const result = await accounts.updateOne(
      { email: "macalaoma12@gmail.com" },
      { 
        $set: { 
          bankAccounts: bankAccounts,
          nin: "95610567432"
        } 
      }
    );
    
    if (result.modifiedCount > 0) {
      console.log('✅ Bank accounts updated successfully');
      
      const user = await accounts.findOne({ email: "macalaoma12@gmail.com" });
      console.log('\nUpdated user:');
      console.log(`NIN: ${user.nin}`);
      console.log(`Bank Accounts: ${user.bankAccounts.length}`);
    } else {
      console.log('⚠️  No changes made');
    }
    
  } catch (error) {
    console.error("Error:", error.message);
  } finally {
    await client.close();
  }
}

manualUpdateBankAccounts();
