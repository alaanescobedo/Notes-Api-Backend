const User = require('../models/userModel')
const catchAsync = require('../utils/catchAsync')

exports.getAllUsers = catchAsync(async (req, res) => {
  const users = await User.find({}).populate('notes', {
    content: 1,
    date: 1
  })
  res.json(users)
})
