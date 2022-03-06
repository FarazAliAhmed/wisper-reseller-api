const mongoose = require("mongoose");
const Joi = require("joi");
const Schema = mongoose.Schema;

const dataBalanceSchema = new Schema({
  business: {
    type: Schema.Types.ObjectId,
    ref: "account",
  },
  data_volume: {
    type: Number,
    default: 0,
  },
  data_unit: {
    type: String,
    default: "MB",
  },
  last_purchase: {
    type: Date,
    default: Date.now(),
  },
});

dataBalanceSchema.virtual("walletBalance")
  .get(function(){
    return (this.data_volume / 1024) * 300
  })
  .set(function(v){
    const moneyToData = (parseInt(v) / 300) * 1024
    this.set({ data_volume: moneyToData})
  });

const validateBalance = () => {};

module.exports = mongoose.model("balance", dataBalanceSchema);
