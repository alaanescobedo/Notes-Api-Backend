const User = require('../models/userModel')
const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const { api, getAllUsers } = require('./helpers')
const { server } = require('../app')

describe.only('creating a new user', () => {
  beforeEach(async () => {
    await User.deleteMany({})

    const passwordHash = await bcrypt.hash('pass1234', 12)
    const user = new User({
      username: 'alaan1132test',
      name: 'AlanTest',
      password: passwordHash
    })

    await user.save()
  })

  test('works as expected creating a fresh username', async () => {
    const usersAtStart = await getAllUsers()

    const newUser = {
      username: 'taco1132test',
      name: 'Pedro',
      password: 't0mate'
    }

    await api
      .post('/api/v1/users')
      .send(newUser)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    const usersAtEnd = await getAllUsers()

    expect(usersAtEnd).toHaveLength(usersAtStart.length + 1)

    const usernames = usersAtEnd.map(user => user.username)
    expect(usernames).toContain(newUser.username)
  })
})

afterAll(() => {
  mongoose.connection.close()
  if (server) {
    server.close()
  }
})
