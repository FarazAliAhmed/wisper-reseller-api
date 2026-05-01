require("dotenv").config({ path: __dirname + "/.env" });
const mongoose = require("mongoose");

async function checkUsersPhone() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB\n");

    const Account = mongoose.model("Account", new mongoose.Schema({}, { strict: false }), "accounts");

    // Get all users
    const allUsers = await Account.find({}).select('_id name username email phone phoneNumber');

    console.log("=== ALL EXISTING USERS ===\n");
    console.log(`Total Users: ${allUsers.length}\n`);

    allUsers.forEach((user, index) => {
      const phone = user.phone || user.phoneNumber || null;
      const hasPhone = phone ? '✓' : '✗';
      
      console.log(`${index + 1}. ${hasPhone} ${user.name || user.username} (${user.email})`);
      console.log(`   ID: ${user._id}`);
      console.log(`   Phone: ${phone || 'NOT SET'}`);
      console.log('');
    });

    // Count users without phone
    const usersWithoutPhone = allUsers.filter(u => !u.phone && !u.phoneNumber);
    const usersWithPhone = allUsers.filter(u => u.phone || u.phoneNumber);

    console.log("\n=== SUMMARY ===\n");
    console.log(`Users WITH phone number: ${usersWithPhone.length}`);
    console.log(`Users WITHOUT phone number: ${usersWithoutPhone.length}`);

    if (usersWithoutPhone.length > 0) {
      console.log("\n=== USERS WITHOUT PHONE NUMBER ===\n");
      usersWithoutPhone.forEach((user, index) => {
        console.log(`${index + 1}. ${user.name || user.username} (${user.email})`);
        console.log(`   ID: ${user._id}`);
      });
    }

    await mongoose.connection.close();
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
}

checkUsersPhone();
