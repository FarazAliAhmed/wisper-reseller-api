const config = require('config')
const jwt = require('jsonwebtoken')

// Middleware for getting user from authorization token
const getUser = async (req, res, next) => {

    if(req.headers && req.headers.authorization){
        const authToken = req.get('authorization').split(" ")[1]
        try{
            const decode = await jwt.verify(authToken, config.get('jwtSecret'))
            req.user = decode
            return next()
        }catch(e){
            return res.status(400).json({error: "Authorization Token is invalid"})
        }
    }
    return res.status(400).json({error: "Authorization Token not provided"})
}

module.exports = getUser 