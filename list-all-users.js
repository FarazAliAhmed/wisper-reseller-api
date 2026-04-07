require('dotenv').config();
const mongoose = require('mongoose');

async function listAllUsers() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    
    const users = await mongoose.connection.db.collection('accounts').find({}).toArray();
    
    console.log(`=== TOTAL USERS: ${users.length} ===\n`);
    
    users.forEach((user, index) => {
      console.log(`${index + 1}. ${user.email || user.username || 'No email'}`);
      console.log(`   Name: ${user.firstName || ''} ${user.lastName || ''}`);
      console.log(`   Type: ${user.type || 'N/A'}`);
      console.log(`   Created: ${user.createdAt || 'N/A'}`);
      console.log('');
    });
    
    await mongoose.connection.close();
  } catch (error) {
    console.error('Error:', error.message);
  }
}

listAllUsers();
