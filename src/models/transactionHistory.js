const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2");
const Schema = mongoose.Schema;

const transactionHistorySchema = new Schema(
  {
    transaction_ref: {
      type: String,
      required: true,
      unique: true, //We want the admin allocation reference to be same with that of the business when the admin allocates for a business
      index: true,
    },
    admin_ref: {
      type: String,
      default: null,
    },
    phone_number: {
      type: String,
      required: true,
    },
    data_volume: {
      type: Number,
      default: null,
    },
    price: {
      type: Number,
      default: null,
    },
    lite_volume: {
      type: String,
      default: null,
    },
    data_price: {
      type: Number,
      default: null,
    },
    new_balance: {
      type: Schema.Types.Mixed,
      default: null,
    },
    business_id: {
      type: String,
      required: true,
    },
    // type of transaction
    purchase_type: {
      type: String,
      default: null,
    },
    desc: {
      type: String,
      default: null,
    },
    volume: {
      type: Number,
      default: null,
    },
    new_bal: {
      type: String,
      default: null,
    },
    old_bal: {
      type: String,
      default: null,
    },
    network_provider: {
      type: String,
      maxlength: 10,
      default: null,
    },
    gloB: {
      type: String,
      default: null,
    },
    status: {
      type: String,
      maxlength: 20,
      required: true,
    },
    created_at: {
      type: String,
      default: `${new Date()}`,
    },
  },
  { timestamps: true }
);

transactionHistorySchema.plugin(mongoosePaginate);

module.exports = mongoose.model("transaction", transactionHistorySchema);
