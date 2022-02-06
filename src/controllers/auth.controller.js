const Joi = require('joi')

const authService = require('../services/auth.service')

const handleLogin = async (req, res) => {
  const { error } = validate(req.body)
  if (error) return res.status(400).send(error.details[0].message)

  const data = await authService.auth(req.body.email, req.body.password)

  if (data.user) {
    const token = data.user.generateAuthToken()
    return res.send(token)
  }
  return res.status(data.status).send(data.message)
}

const validate = (requestBody) => {
  const schema = Joi.object({
    email: Joi.string().min(5).max(255).required().email(),
    password: Joi.string().min(5).max(255).required()
  })

  return schema.validate(requestBody)
}

module.exports = {
  handleLogin
}
