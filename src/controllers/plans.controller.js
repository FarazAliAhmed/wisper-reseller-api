const res = require('express/lib/response')
const {plans} = require('../utils/networkData')

const getPlans = (req, res) => {
    res.status(200).json(plans)
}

module.exports = {
    getPlans
}