const router = require('express').Router()
const testingController = require('../controllers/testingController')

router.post('/reset', testingController.clearTestDB)

module.exports = router
