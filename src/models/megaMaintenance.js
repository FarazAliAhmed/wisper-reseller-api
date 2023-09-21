const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const megaMaintenance = new Schema({
  mtn_sme: {
    type: Boolean,
    default: false,
  },
  mtn_gifting: {
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

// NOTE - About megaMaintenance Mood
/**
 * The network provider is under megamaintenance and not available for use when the value is TRUE
 * When the value is FALSE, the provider is NOT under megamaintenance and hence available for use by customers
 */

module.exports = mongoose.model("megaMaintenance", megaMaintenance);
