const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const AirtimeMaintenance = new Schema({
  mtn: {
    type: Boolean,
    default: false,
  },
  airtel: {
    type: Boolean,
    default: false,
  },
  glo: {
    type: Boolean,
    default: false,
  },
  "9mobile": {
    type: Boolean,
    default: false,
  },
  notice: {
    type: String,
    default: null,
  },
});

// NOTE - About Maintenance Mood
/**
 * The network provider is under maintenance and not available for use when the value is TRUE
 * When the value is FALSE, the provider is NOT under maintenance and hence available for use by customers
 */

module.exports = mongoose.model("airtimeMaintenance", AirtimeMaintenance);
