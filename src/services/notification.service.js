const mongoose = require("mongoose");
const Notification = require("../models/notifications");
const dataBalance = require("../models/dataBalance");
const Maintenance = require("../models/maintenance");

const addNotificationService = async (notificationData) => {
  const newNotification = new Notification(notificationData);
  await newNotification.save();
  return newNotification;
};

const addAdminNoti = async (content) => {
  const notification = new Notification({
    business: null, // Set to null for admin notifications for all users
    content,
    status: "admin",
    color: "#800080",
  });

  await notification.save();

  if (notification) return { notification };
  return {
    status: 500,
    error: true,
    message: "Unable to get notification",
  };
};

const getAll = async (business_id) => {
  // const business_id = mongoose.Types.ObjectId(id);
  // const notification = Notification.findOne({ business: business_id });
  const notification = await Notification.find({
    $or: [{ business: business_id }, { business: null, status: "admin" }],
  });

  if (notification) return { notification };
  return {
    status: 500,
    error: true,
    message: "Unable to get notification",
  };
};

const checkAdd = async (business_id) => {
  // const business_id = mongoose.Types.ObjectId(id);
  const userAccount = await dataBalance.findOne({ business: business_id });

  console.log(userAccount.mega_wallet);

  try {
    if (userAccount.wallet_balance > 0) {
      const lowWalletNotification = new Notification({
        business: business_id,
        content: "Your wallet balance is low. Please fund your wallet.",
        status: "warning",
        color: "#FFA500", // Orange color for warning status
        hasRead: false,
      });

      await lowWalletNotification.save();
    }

    for (network in userAccount.mega_wallet) {
      if (userAccount.mega_wallet[network] > 0 && network != "unit") {
        const notificationData = {
          business: business_id,
          content: `Mega wallet for ${network} is low. Please recharge your ${network} mega wallet.`,
          status: "warning",
          color: "#FFA500", // Orange color for warning status
          hasRead: false,
        };

        const notification = new Notification(notificationData);
        await notification.save();
      }
    }

    const maintenance = await Maintenance.findOne().exec();

    if (maintenance.mtn_sme) {
      createMaintenanceNotification("MTN SME", business_id);
    }

    if (maintenance.mtn_gifting) {
      createMaintenanceNotification("MTN Gifting", business_id);
    }

    if (maintenance.airtel) {
      createMaintenanceNotification("Airtel", business_id);
    }

    if (maintenance.glo) {
      createMaintenanceNotification("Glo", business_id);
    }

    if (maintenance["9mobile"]) {
      createMaintenanceNotification("9mobile", business_id);
    }

    return {
      status: 200,
      error: false,
      message: "Notification has been added",
    };
  } catch (error) {
    return {
      status: 500,
      error: true,
      message: "No Notification Added",
    };
  }
};

// Helper function to create a new maintenance notification
const createMaintenanceNotification = async (network, notificationData) => {
  const notification = new Notification({
    business: notificationData.business,
    content: `Network ${network} is currently under maintenance.`,
    status: "warning",
    color: "#FFA500", // Orange color for warning status
    hasRead: false,
  });

  // Save the new Notification object to the database
  await notification.save();

  return notification;
};

module.exports = {
  addNotificationService,
  getAll,
  checkAdd,
  addAdminNoti,
};
