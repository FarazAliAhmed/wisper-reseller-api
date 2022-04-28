const mongoose = require('mongoose')
const Schema = mongoose.Schema

const Maintenance = new Schema({
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
    }
})

module.exports = mongoose.model("maintenance", Maintenance)

