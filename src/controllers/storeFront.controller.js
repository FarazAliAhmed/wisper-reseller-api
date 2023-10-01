const StoreFront = require("../models/storeFront");

// Create a new store front
exports.createStoreFront = async (req, res) => {
  try {
    const newStoreFront = new StoreFront(req.body);
    const savedStoreFront = await newStoreFront.save();
    res.status(201).json(savedStoreFront);
  } catch (error) {
    console.error("Error creating store front:", error);
    res.status(500).json({ error: "Error creating store front" });
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

// Get all store fronts
exports.getAllStoreFronts = async (req, res) => {
  try {
    const storeFronts = await StoreFront.find();
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
