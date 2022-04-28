const Joi = require('joi')
const Maintenance = require('../models/maintenance')


const getMaintenance = async (req, res) => {
    const existMain = await Maintenance.findOne().exec()
    return res.status(200).json({maintenance: existMain, message: `Successfully fetched`})
    
}


const createMaintenance = async (req, res) => {
    const existMain = await Maintenance.find().exec()
    if(existMain.length > 0){
        return res.status(200).json({messsage: "Maintenance object already created"})
    }
    const newMain = new Maintenance({})
    const maintenanceRes = await newMain.save()
    return res.status(201).json(maintenanceRes)
}


const enterMaintenance = async (req, res) => {
    const {network} = req.params
    const {error} = validateMaintenaceUpdate(network)
    if(error) return res.status(400).json({status: 'failed', message: error.details[0].message})
    const enterMain = await Maintenance.findOneAndUpdate({}, {[network]: true}, {new: true}).exec()
    return res.status(201).json({maintenance: enterMain, message: `${network} is now in maintenace mood`})
}


const exitMaintenance = async (req, res) => {
    const {network} = req.params
    const {error} = validateMaintenaceUpdate(network)
    if(error) return res.status(400).json({status: 'failed', message: error.details[0].message})
    const enterMain = await Maintenance.findOneAndUpdate({}, {[network]: false}, {new: true}).exec()
    return res.status(201).json({maintenance: enterMain, message: `${network} is now in maintenace mood`})
}


const validateMaintenaceUpdate = (field) => {
    const schema = Joi.string()
                    .valid('glo', 'mtn_sme', 'mtn_gifting', 'airtel', '9mobile')
                    .required()
    return schema.validate(field)
}

module.exports = {
    getMaintenance,
    createMaintenance,
    enterMaintenance,
    exitMaintenance,
}