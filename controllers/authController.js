const User = require('../models/userModel')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const catchAsync = require('../utils/catchAsync')
const AppError = require('../utils/appError')

const createSendToken = (user, statusCode, req, res) => {
  const token = jwt.sign(user.id, process.env.JWT_SECRET)

  // res.cookie('jwt', token, {
  //   expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  //   httpOnly: true,
  //   secure: req.secure || req.headers['x-forwarded-proto'] === 'https'
  // })

  user.password = undefined

  res.status(statusCode).json({
    status: 'success',
    token,
    user
  })
}

exports.signup = catchAsync(async (req, res) => {
  const { username, name, password } = req.body

  // Hash the password with cost of 12
  const saltRounds = 12
  const passwordHashed = await bcrypt.hash(password, saltRounds)

  const user = new User({
    username,
    name,
    password: passwordHashed
  })

  const savedUser = await user.save()
  createSendToken(savedUser, 201, req, res)
})

exports.login = catchAsync(async (req, res, next) => {
  const { username, password } = req.body
  // 1) Check if user && password exist
  if (!username || !password) {
    return next(new AppError('Please provide username or password', 400))
  }

  // 2) Check if user && password is correct
  const user = await User.findOne({ username })
  const passwordConfirmed = await user.correctPassword(password, user.password)

  if (!user || !passwordConfirmed) {
    console.log('error')
    return next(new AppError('Invalid user or password'), 401)
  }
  createSendToken(user, 200, req, res)
})

exports.protect = catchAsync(async (req, res, next) => {
  const authorization = req.get('authorization')
  let token
  if (authorization && authorization.toLowerCase().startsWith('bearer')) {
    token = req.headers.authorization.split(' ')[1]
  }

  if (!token) {
    return next(new AppError('No token avaible', 401))
    // return res.status(401).json('Unauthorized')
  }
  // 2) Verification token
  const decoded = jwt.verify(token, process.env.JWT_SECRET)
  const currentUser = await User.findById(decoded)
  req.user = currentUser
  res.locals.user = currentUser

  next()
})
