const { balance_update } = require('./_eventTypes')
const events = require('events')

const BalanceLog = require('../models/balanceLog')
const BalanceEvent = new events.EventEmitter()

BalanceEvent.on(balance_update, function({new_balance, old_balance, type='DEBIT'}){
    const new_log = new BalanceLog({
        business: new_balance.business,
        new_balance,
        old_balance,
        type,
    })
    new_log.save()
})

module.exports = BalanceEvent