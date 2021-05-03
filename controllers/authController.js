const User = require('../models/userModel')
const bcrypt = require('bcrypt')

exports.signup = async (req, res) => {
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

  res.status(201).json(savedUser)
}
