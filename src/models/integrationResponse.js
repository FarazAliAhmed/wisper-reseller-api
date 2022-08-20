const mongoose = require('mongoose')
const Schema = mongoose.Schema

const IntegrationResponse = new Schema({
    integration: {
        type: String,
        required: true
    },
    response: {
        type: Object,
    },
    created_at: {
        type: Date,
        default: Date.now()
    }
})

module.exports = mongoose.model('integrationResponse', IntegrationResponse)