const {
    getAll,
    getOne,
    getAdmins
} = require('../services/business.service')

const getAllBusiness = async (req, res, next) => {
    const resp = await getAll()
    if(resp.error) return res.status(400).json(resp)

    let business = {
        mega: [],
        lite: []
    }
    resp.business.forEach(buss => {
        if(buss.type === "mega"){
            business.mega.push(buss)
        }else{
            business.lite.push(buss)
        }
    })
    return res.status(200).json(business)
}

const getOneBusiness = async (req, res, next) => {
    const account_id = req.params.account_id
    const resp = await getOne(account_id)
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