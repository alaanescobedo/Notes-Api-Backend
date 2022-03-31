const supertest = require('supertest')
const server = require('../server')
const User = require('../models/userModel')

const api = supertest(server)

const initialNotes = [
  {
    content: 'HTML is easy',
    date: new Date(),
    important: true
  },
  {
    content: 'Browser can execute only JavaScript',
    date: new Date(),
    important: false
  }
]

const initialUsers = [
  {
    username: 'alaan1132test',
    name: 'AlanTest',
    password: 'password1'
  },
  {
    username: 'tacotest',
    name: 'TacoTest',
    password: 'password2'
  },
  {
    username: 'churrotest',
    name: 'ChurroTest',
    password: 'password'
  }
]

const getAllContentsFromNotes = async () => {
  const response = await api.get('/api/v1/notes')
  return {
    response,
    contents: response.body.map(note => note.content)
  }
}

const getAllUsers = async () => {
  const usersDB = await User.find({})
  return usersDB.map(user => user.toJSON())
}

const getUser = async () => {
  return await User.findOne({})
}

module.exports = {
  api,
  initialNotes,
  initialUsers,
  getAllContentsFromNotes,
  getAllUsers,
  getUser
}
