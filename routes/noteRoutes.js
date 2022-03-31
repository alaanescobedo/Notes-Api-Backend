const router = require('express').Router()
const noteRouter = require('../controllers/noteController')
const authController = require('../controllers/authController')

router.get('/', noteRouter.getAllNotes)

router.use(authController.protect)
router.post('/', noteRouter.postNote)

router
  .route('/:id')
  .get(noteRouter.getNote)
  .patch(noteRouter.patchNote)
  .delete(noteRouter.deleteNote)

module.exports = router
