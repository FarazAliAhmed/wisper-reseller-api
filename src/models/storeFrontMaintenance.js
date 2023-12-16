const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const sFMaintenance = new Schema({
  withdrawal: {
    type: Boolean,
    default: false,
  },
  purchase: {
    type: Boolean,
    default: false,
  },
});

// NOTE - About sFMaintenance Mood
/**
 * The network provider is under sFmaintenance and not available for use when the value is TRUE
 * When the value is FALSE, the provider is NOT under sFmaintenance and hence available for use by customers
 */

module.exports = mongoose.model("sFMaintenance", sFMaintenance);
