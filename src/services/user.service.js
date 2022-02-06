const bcrypt = require('bcrypt')
const _ = require('lodash')

const { Account } = require('../models/account')

const register = async (requestBody, email) => {
  let user = await Account.findOne({ email }).exec()
  if (user) return { status: 400, message: 'User already registered.' }

  user = new Account(_.pick(requestBody, ['name', 'email', 'password']))
  const salt = await bcrypt.genSalt(10)
  user.password = await bcrypt.hash(user.password, salt)
  await user.save()

  return { user }
}

module.exports = { register }
