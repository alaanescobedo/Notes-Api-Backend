const Note = require('../models/noteModel')
const User = require('../models/userModel')
const catchAsync = require('../utils/catchAsync')
const AppError = require('../utils/appError')

exports.getAllNotes = catchAsync(async (req, res, next) => {
  const notes = await Note.find({}).populate('user', {
    username: 1,
    name: 1
  })

  res.json(notes)
})

exports.getNote = catchAsync(async (req, res, next) => {
  const { id } = req.params

  const note = await Note.findById(id)

  if (!note) {
    return next(new AppError('Not found', 404))
  }

  res.json(note)
})

exports.postNote = catchAsync(async (req, res, next) => {
  const { content, important = false } = req.body
  if (!content) {
    return next(new AppError('note.content is missing', 400))
  }
  const user = await User.findById(req.user.id)

  const newNote = new Note({
    content,
    date: new Date().toISOString(),
    important,
    user: req.user._id
  })

  const savedNote = await newNote.save()
  user.notes = user.notes.concat(savedNote._id)
  await user.save()
  res.status(201).json(savedNote)
})

exports.deleteNote = catchAsync(async (req, res, next) => {
  const { id } = req.params
  await Note.findByIdAndDelete(id)
  res.status(204).end()
})

exports.patchNote = async (req, res, next) => {

}
