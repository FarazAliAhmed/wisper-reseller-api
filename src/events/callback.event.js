const events = require('events')
const axios = require('axios')
const {handle_callback} = require('./_eventTypes')

const CallbackEvent = new events.EventEmitter()

CallbackEvent.on(handle_callback, async function({callback, payload}){
    try{
        await axios.post(callback, payload, {headers: {'Content-Type': 'application/json'}})
    }catch(e){
        // do nothing
    }
})

module.exports = CallbackEvent