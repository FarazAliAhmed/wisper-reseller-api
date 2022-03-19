const { network_ids } = require('../utils/networkData')

const getNetworks = (req, res) => {
    res.status(200).json({networks: Object.values(network_ids)})
}

module.exports = {
    getNetworks
}