const config = require('config')
const jwt = require('jsonwebtoken')

// Middleware for getting admin from authorization token
// should also check for is admin
const getAdmin = async (req, res, next) => {

    if(req.headers && req.headers.authorization){
        const authToken = req.get('authorization').split(" ")[1]
        try{
            const decode = await jwt.verify(authToken, config.get('jwtSecret'))
            if(decode.isAdmin){
                req.user = decode
                return next()
            }
            return res.status(403).json({error: "Invalid Access Rights"})
        }catch(e){
            return res.status(400).json({error: "Authorization Token is invalid"})
        }
    }
    return res.status(400).json({error: "Authorization Token not provided"})
}

module.exports = getAdmin 