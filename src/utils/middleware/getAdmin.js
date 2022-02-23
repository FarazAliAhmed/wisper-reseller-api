const config = require('config')
const jwt = require('jsonwebtoken')

// Middleware for getting admin from authorization token
// should also check for is admin
const getAdmin = async (req, res, next) => {

    if(req.headers && req.headers.authorization){
        const authToken = req.get('authorization').split(" ")[1]
        try{
            const decode = await jwt.verify(authToken, config.get('jwtSecret'))
            req.user = decode
            // fetch user account and check of isAdmin is True. If true, call next()
            return next()
        }catch(e){
            return res.status(400).json({error: "Authorization Token is invalid"})
        }
    }
    return res.status(400).json({error: "Authorization Token not provided"})
}

module.exports = getAdmin 