const mongoose = require('mongoose')
const Schema = mongoose.Schema
const { create: createEmptyBalance } = require('../services/balance.service')

const BusinessSchema = new Schema({
  business_id: {
    type: Schema.Types.objectId,
    auto: true
  },
  business_name: {
    type: String,
    lowercase: true
  },
  account: {
    type: Schema.Types.objectId,
    ref: 'account'
  },
  number_of_customers: {
    type: Number,
    default: 0
  },
  serviced_networ: {
    type: [{ network_provider: String }]
  }
})

// automatically create an empty balance when a business Account is created
BusinessSchema.post('save', async function (next) {
  const businessId = this.business_id
  await createEmptyBalance(businessId)
  next()
})

module.exports = {
  business: mongoose.model('business', BusinessSchema)
}
