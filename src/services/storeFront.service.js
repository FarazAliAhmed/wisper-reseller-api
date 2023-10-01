const StoreFront = require("../models/storeFront");

// Get a store front by business_id
exports.getStoreFrontByBusinessId = async (businessId) => {
  try {
    const storeFront = await StoreFront.findOne({ business_id: businessId });
    return storeFront;
  } catch (error) {
    throw error;
  }
};

// Get all store fronts
exports.getAllStoreFronts = async () => {
  try {
    const storeFronts = await StoreFront.find();
    return storeFronts;
  } catch (error) {
    throw error;
  }
};

// Create a new store front
exports.createStoreFront = async (data) => {
  // Check if the data contains the 'wallet' field
  if ("wallet" in data) {
    throw new Error(
      'Cannot include the "wallet" field when creating a store front.'
    );
  }

  try {
    const newStoreFront = new StoreFront(data);
    const savedStoreFront = await newStoreFront.save();
    return savedStoreFront;
  } catch (error) {
    throw error;
  }
};

// Update a store front by business_id
exports.updateStoreFront = async (businessId, updates) => {
  // Check if the updates contain the 'wallet' field
  if ("wallet" in updates) {
    throw new Error(
      'Cannot include the "wallet" field when updating a store front.'
    );
  }

  try {
    const updatedStoreFront = await StoreFront.findOneAndUpdate(
      { business_id: businessId },
      updates,
      { new: true }
    );
    return updatedStoreFront;
  } catch (error) {
    throw error;
  }
};
