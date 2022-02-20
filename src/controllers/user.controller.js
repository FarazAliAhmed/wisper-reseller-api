const _ = require('lodash')
const { validateUser } = require('../models/account')

const userService = require('../services/user.service')

const handleRegister = async (req, res) => {
  const { error } = validateUser(req.body)
  if (error) return res.status(400).send(error.details[0].message)

  const data = await userService.register(req.body)

  if (data.user) {
    const token = data.user.generateAuthToken()
    return res
      .header("x-auth-token", token)
      .header("access-control-expose-headers", "x-auth-token")
      .send(_.pick(data.user, ['_id', 'name', 'email']))
  }
  return res.status(data.status).send(data.message)
};

module.exports = handleRegister
