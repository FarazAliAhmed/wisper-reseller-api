const { Account } = require("../models/account");
const storeFront = require("../models/storeFront");
const StoreFront = require("../models/storeFront");

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
        storeUserName: username,
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

    const account = await storeFront.findOne({
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
    res.status(200).json(storeFront);
  } catch (error) {
    console.error("Error getting store front by business_id:", error);
    res.status(500).json({ error: "Error getting store front" });
  }
};

// Get a store front by business_id
exports.getStoreFrontByUserName = async (req, res) => {
  const userName = req.params.username;
  try {
    const storeFront = await StoreFront.findOne({ storeUserName: userName });
    if (!storeFront) {
      return res.status(404).json({ error: "Store front not found" });
    }
    res.status(200).json(storeFront);
  } catch (error) {
    console.error("Error getting store front by business_id:", error);
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
