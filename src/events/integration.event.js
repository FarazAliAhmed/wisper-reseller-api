const { integration_response } = require('./_eventTypes')
const events = require('events')
const IntegrationEvents = new events.EventEmitter()

const IntegrationResponse = require('../models/integrationResponse')

IntegrationEvents.on(integration_response, function({integration, response}){
    const new_response = new IntegrationResponse({
        integration,
        response
    })
    new_response.save()
})

module.exports = IntegrationEvents