const express = require('express')
const router = express.Router()

const { handleLogin } = require('../controllers/auth.controller')
const handleRegister = require('../controllers/user.controller')

router.post('/auth', handleLogin)
router.post('/users', handleRegister)

module.exports = router
