const {Account} = require('../../models/account')

const parseKey = async (req, res, next) => {
    const api_key = req.body.api_key
    const account = await Account.findOne({access_token: api_key}).exec()
    if (!account) return res.status(401).json({error: true, message: "invalid access token"})
    req.user = account
    next()
}

module.exports = parseKey