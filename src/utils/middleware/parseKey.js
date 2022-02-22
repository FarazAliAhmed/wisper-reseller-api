const {Account} = require('../../models/account')

const parseKey = async (req, res, next) => {
    if (req.headers && req.headers["x-api-key"]){
        const api_key = req.headers["x-api-key"]
        const account = await Account.findOne({access_token: api_key}).exec()
        if (!account) return res.status(401).json({error: true, message: "invalid access token"})
        req.user = account
        return next()
    }
    return res.status(400).json({message: "API Token not provided in request header"})
}

module.exports = parseKey