const mongoose = require('mongoose')
const joi = require('joi')
const Schema = mongoose.Schema

const DataBalance = new Schema({
  business: {
    type: Schema.Types.ObjectId,
    ref: 'account'
  },
  data_volume: {
    type: Number,
    default: 0
  },
  data_unit: {
    type: String,
    default: 'MB'
  },
  last_purchase: {
    type: Date,
    default: Date.now()
  }
})

const validateBalance = () => {

}

module.exports = mongoose.model('balance', DataBalance)
