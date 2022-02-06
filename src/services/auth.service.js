const bcrypt = require('bcrypt')

const { Account } = require('../models/account')

const auth = async (email, password) => {
  const user = await Account.findOne({ email }).exec()
  if (!user) return { status: 400, message: 'Invalid email or password.' }

  const validPassword = await bcrypt.compare(password, user.password)
  if (!validPassword) { return { status: 400, message: 'Invalid email or password.' } }

  return { user }
}

module.exports = { auth }
