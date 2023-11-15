const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const storeFrontSchema = new Schema({
  business_id: {
    type: String,
    required: true,
    unique: true,
  },
  wallet: {
    type: Number,
    default: 0,
  },
  storeName: {
    type: String,
    default: null,
  },
  storeUserName: {
    type: String,
    default: null,
  },
  storeImg: {
    type: String,
    default: null,
  },
  storeMaintenance: {
    type: Boolean,
    default: true,
  },
  storeColor: {
    type: String,
    default: null,
  },
  storeDesc: {
    type: String,
    default: null,
  },
  storeURL: {
    type: String,
    default: null,
  },
  storePin: {
    type: String,
    default: null,
  },
  token: {
    type: String,
    default: null,
  },
  acctName: {
    type: String,
    default: null,
  },
  withdrawAccount: {
    type: String,
    default: null,
  },
  bankName: {
    type: String,
    default: null,
  },
  bankCode: {
    type: String,
    default: null,
  },
  phoneNumber: {
    type: String,
    default: null,
  },
  socialLinks: {
    whatsapp: {
      type: String,
      default: null,
    },
    instagram: {
      type: String,
      default: null,
    },
    twitter: {
      type: String,
      default: null,
    },
    facebook: {
      type: String,
      default: null,
    },
  },
});

module.exports = mongoose.model("storeFront", storeFrontSchema);
