const catchAsync = require('../utils/catchAsync')
const Note = require('../models/noteModel')
const User = require('../models/userModel')

exports.clearTestDB = catchAsync(async (req, res) => {
  console.log('testing route')
  await Note.deleteMany({})
  await User.deleteMany({})
  console.log('testing after clear')
  res.status(204).end()
})
