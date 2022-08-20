const mongoose = require('mongoose')
const Schema = mongoose.Schema

const BalanceLog = new Schema({
    business: {
        type: Schema.Types.ObjectId,
        ref: "account",
    },
    old_balance: {
        type: Object,
        required: true
    },
    new_balance: {
        type: Object,
        required: true
    },
    type: {
        type: String,
        enum: ['CREDIT', 'DEBIT'],
        default: 'DEBIT'
    }
})

module.exports = mongoose.model('balanceLog', BalanceLog)