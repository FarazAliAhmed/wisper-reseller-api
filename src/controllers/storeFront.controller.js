const { Account } = require("../models/account");
const storeFront = require("../models/storeFront");
const StoreFront = require("../models/storeFront");
const storeFrontHistory = require("../models/storeFrontHistory");

const uuidv4 = require("uuid/v4");

// Install with: npm i flutterwave-node-v3

const Flutterwave = require("flutterwave-node-v3");
const {
  withdrawStoreFrontService,
  storeFrontAnalysisService,
  storeFrontUserPlanService,
} = require("../services/storeFront.service");
const flw = new Flutterwave(
  process.env.FLW_PUBLIC_KEY,
  process.env.FLW_SECRET_KEY
);

// Create a new store front
exports.createStoreFront = async (req, res) => {
  try {
    const accounts = await Account.find({
      _id: { $exists: true },
      username: { $exists: true },
    });

    for (const account of accounts) {
      const { _id, username, name } = account;

      const storeFront = new StoreFront({
        business_id: _id.toString(),
        storeName: name,
      });

      // Save the store front to the database
      await storeFront.save();
      console.log(`Store front created for ${username}`);
    }

    res.status(201).json("Store fronts created for all accounts.");
  } catch (error) {
    console.error("Error creating store front:", error);
    res.status(500).json({ error: "Error creating store front" });
  }
};

exports.checkStoreFrontUserName = async (req, res) => {
  try {
    const { username } = req.params;

    const account = await StoreFront.findOne({
      storeUserName: username,
    });

    if (account) {
      return res.status(201).json(true);
    } else {
      return res.status(201).json(false);
    }
  } catch (error) {
    console.error("Error checking store front:", error);
    res.status(500).json({ error: "Error checking store front" });
  }
};

// Get a store front by business_id
exports.getStoreFrontByBusinessId = async (req, res) => {
  const businessId = req.params.business_id;
  try {
    const storeFront = await StoreFront.findOne({ business_id: businessId });
    if (!storeFront) {
      return res.status(404).json({ error: "Store front not found" });
    }

    const uniquePhoneCount = await storeFrontHistory.aggregate([
      {
        $match: { storeBusiness: businessId },
      },
      {
        $group: {
          _id: "$phone",
        },
      },
      {
        $group: {
          _id: null,
          count: {
            $sum: 1,
          },
        },
      },
    ]);

    const totalUniquePhoneCount =
      uniquePhoneCount.length > 0 ? uniquePhoneCount[0].count : 0;

    // Add the count to the storeFront object before sending the response
    const responseObj = {
      ...storeFront.toObject(),
      customer: totalUniquePhoneCount,
    };
    res.status(200).json(responseObj);
  } catch (error) {
    console.error("Error getting store front by business_id:", error);
    res.status(500).json({ error: "Error getting store front" });
  }
};

// Get a store front by username
exports.getStoreFrontByUserName = async (req, res) => {
  const userName = req.params.username;
  try {
    const storeFront = await StoreFront.findOne({ storeUserName: userName });
    if (!storeFront) {
      return res.status(404).json({ error: "Store front not found" });
    }

    const uniquePhoneCount = await storeFrontHistory.aggregate([
      {
        $match: { storeBusiness: storeFront._id },
      },
      {
        $group: {
          _id: "$phone",
        },
      },
      {
        $group: {
          _id: null,
          count: {
            $sum: 1,
          },
        },
      },
    ]);

    const totalUniquePhoneCount =
      uniquePhoneCount.length > 0 ? uniquePhoneCount[0].count : 0;

    // Add the count to the storeFront object before sending the response
    const responseObj = {
      ...storeFront.toObject(),
      customer: totalUniquePhoneCount,
    };
    res.status(200).json(responseObj);
  } catch (error) {
    console.error("Error getting store front by username:", error);
    res.status(500).json({ error: "Error getting store front" });
  }
};

// Get all store fronts
exports.getAllStoreFronts = async (req, res) => {
  try {
    const { limit = 10, page = 1 } = req.query;
    const skip = (page - 1) * limit;

    const storeFronts = await StoreFront.find()
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    res.status(200).json(storeFronts);
  } catch (error) {
    console.error("Error getting all store fronts:", error);
    res.status(500).json({ error: "Error getting all store fronts" });
  }
};

// Get all store fronts
exports.getAllStoreFrontHistoryBusiness = async (req, res) => {
  try {
    const { limit = 10, page = 1 } = req.query;
    const { business_id } = req.params;
    const skip = (page - 1) * limit;

    const storeFronts = await storeFrontHistory
      .find({
        storeBusiness: business_id,
      })
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    res.status(200).json(storeFronts);
  } catch (error) {
    console.error("Error getting all store fronts:", error);
    res.status(500).json({ error: "Error getting all store fronts" });
  }
};

// Get all store fronts
exports.getAllStoreFrontHistory = async (req, res) => {
  try {
    const { limit = 10, page = 1 } = req.query;
    const skip = (page - 1) * limit;

    const storeFronts = await storeFrontHistory
      .find()
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    res.status(200).json(storeFronts);
  } catch (error) {
    console.error("Error getting all store fronts:", error);
    res.status(500).json({ error: "Error getting all store fronts" });
  }
};

// Update a store front by business_id
exports.updateStoreFront = async (req, res) => {
  const businessId = req.params.business_id;
  const updates = req.body;

  try {
    const updatedStoreFront = await StoreFront.findOneAndUpdate(
      { business_id: businessId },
      updates,
      { new: true }
    );

    if (!updatedStoreFront) {
      return res.status(404).json({ error: "Store front not found" });
    }

    res.status(200).json(updatedStoreFront);
  } catch (error) {
    console.error("Error updating store front:", error);
    res.status(500).json({ error: "Error updating store front" });
  }
};

// Get all store fronts data
exports.checkPhoneStoreFronts = async (req, res) => {
  try {
    const { phone } = req.params;

    const sFData = await storeFrontHistory.findOne({ phone });

    if (!sFData) {
      res.status(200).json(null);
      return;
    }

    res.status(200).json({ name: sFData.name, email: sFData.email });
  } catch (error) {
    console.error("Error getting all store fronts:", error);
    res.status(500).json({
      error: "Error getting store fronts data",
      message: error.message,
    });
  }
};

exports.uploadImageStoreFronts = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No image file provided" });
    }

    console.log();

    const url = req.protocol + "://" + req.get("host");
    const profileImg = url + "/uploads/" + req.file.filename;

    return res.json(profileImg);
  } catch (error) {
    console.error(error); // Use console.error instead of console.log for errors
    return res.status(500).json({
      error: error.message,
    });
  }
};

exports.withdrawStoreFronts = async (req, res, next) => {
  const business = req.params.business;
  const { amount, withType } = req.body;

  try {
    const withdrawStore = await withdrawStoreFrontService(
      business,
      withType,
      amount
    );

    return res.json(withdrawStore);
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      error: error.message,
    });
  }
};

exports.storeAnalysis = async (req, res, next) => {
  const business = req.params.business;

  try {
    const analytics = await storeFrontAnalysisService(business);

    return res.json(analytics);
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      error: error.message,
    });
  }
};

exports.createAllUserPlans = async (req, res) => {
  try {
    const response = await storeFrontUserPlanService();

    return res
      .status(200)
      .json({ message: "user plan created successfully", data: response });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      error: error.message,
    });
  }
};

exports.customerStoreFronts = async (req, res) => {
  const targetStoreBusiness = req.params.id; // Get the storeBusiness from the URL parameter

  const pipeline = [
    {
      $match: {
        storeBusiness: targetStoreBusiness, // Match the desired storeBusiness
      },
    },
    {
      $group: {
        _id: "$phone", // Group by unique phone numbers
        name: { $first: "$name" }, // Get the name of the first occurrence
        email: { $first: "$email" }, // Get the email of the first occurrence
        dateJoined: { $first: "$date" }, // Get the date of the first occurrence
        numberOfPurchases: { $sum: 1 }, // Count the number of purchases
      },
    },
    {
      $project: {
        _id: 0, // Exclude the _id field
        phone: "$_id", // Rename _id to phone
        name: 1,
        email: 1,
        dateJoined: 1,
        numberOfPurchases: 1,
      },
    },
  ];

  storeFrontHistory.aggregate(pipeline, (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "An error occurred" });
    }
    res.json(result);
  });
};

exports.storeFrontNotice = async (req, res) => {
  try {
    const business = req.params.business; // Get the storeBusiness from the URL parameter

    const storeProf = await StoreFront.findOne({ business_id: business });

    if (!storeProf) {
      return res.status(404).json({ error: "Store front not found" });
    }

    const storeHistory = await storeFrontHistory.find({
      storeBusiness: business,
    });

    if (
      storeProf.storeName &&
      storeProf.storeUserName &&
      storeHistory.length > 0
    ) {
      return res.send(true);
    } else {
      return res.send(false);
    }
  } catch (error) {
    return res.status(500).json({ message: "Error Occured" });
  }
};

// Function to generate a UUID as a transaction reference
function generateTransactionReference() {
  return uuidv4();
}
