const {
    getAll,
    getOne,
    getAdmins
} = require('../services/business.service')

const {
    getBalance
} = require('../services/balance.service')

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
    const resp = await Promise.all([
        getOne(account_id),
        getBalance(account_id)
    ])
    if(resp[0].error) return res.status(400).json(resp[0])
    if(resp[1].error || resp[1].status === 500) return res.status(400).json(resp[1])
    const returnObj = {
        business: resp[0].business,
        balance: resp[1].balance
    }
    return res.status(200).json(returnObj)
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