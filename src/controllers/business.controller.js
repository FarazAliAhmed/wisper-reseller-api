const {
    getAll,
    getOne,
    getAdmins
} = require('../services/business.service')

const getAllBusiness = async (req, res, next) => {
    const resp = await getAll()
    if(resp.error) return res.status(400).json(resp)
    return res.status(200).json(resp.business)
}

const getOneBusiness = async (req, res, next) => {
    const resp = await getOne()
    if(resp.error) return res.status(400).json(resp)
    return res.status(200).json(resp.business)
}

const getSystemAdmins = async (req, res, next) => {
    const resp = await getAdmins()
    if(resp.error) return res.status(200).json(resp)
    return res.status(200).json(resp.admin)
}


module.exports = {
    getAllBusiness,
    getOneBusiness,
    getSystemAdmins,
}