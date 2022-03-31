const router = require('express').Router()
const authController = require('../controllers/authController')
const userController = require('../controllers/userController')

router.post('/signup', authController.signup)
router.post('/login', authController.login)

router.use(authController.protect)
router.get('/', userController.getAllUsers)

module.exports = router
