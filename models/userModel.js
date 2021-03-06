const mongoose = require('mongoose')
const bcrypt = require('bcrypt')

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, 'username is required'],
    unique: true
  },
  name: {
    type: String,
    required: [true, 'A name is required']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: 8
  },
  notes: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Note'
    }
  ]
})

userSchema.methods.correctPassword = async function (password, passwordHashed) {
  return await bcrypt.compare(password, passwordHashed)
}

userSchema.set('toJSON', {
  transform: (_, returnObject) => {
    returnObject.id = returnObject._id
    delete returnObject._id
    delete returnObject.__v
    delete returnObject.password
  }
})

const User = mongoose.model('User', userSchema)

module.exports = User
