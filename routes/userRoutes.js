const router = require('express').Router()

const authController = require('../controllers/authController')

router.post('/', authController.signup)

module.exports = router
