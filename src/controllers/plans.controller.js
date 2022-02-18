const res = require('express/lib/response')
const {plans} = require('../utils/networkData')

const getPlans = (req, resp) => {
    res.status(200).json(plans)
}

module.exports = {
    getPlans
}