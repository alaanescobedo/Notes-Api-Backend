const User = require('../models/userModel')
const bcrypt = require('bcrypt')
const { api, initialUsers, getAllUsers } = require('./helpers')
const mongoose = require('mongoose')
const server = require('../server')

beforeEach(async () => {
  await User.deleteMany({})

  for (const user of initialUsers) {
    const passwordHash = await bcrypt.hash('pass1234', 12)
    user.password = passwordHash
    const userObj = await new User(user)
    await userObj.save()
  }
})

describe('creating a new user', () => {
  test('works as expected creating a fresh username', async () => {
    const usersAtStart = await getAllUsers()

    const newUser = {
      username: 'taco1132test',
      name: 'Pedro',
      password: 't0mate'
    }

    await api
      .post('/api/v1/users/signup')
      .send(newUser)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    const usersAtEnd = await getAllUsers()

    expect(usersAtEnd).toHaveLength(usersAtStart.length + 1)

    const usernames = usersAtEnd.map(user => user.username)
    expect(usernames).toContain(newUser.username)
  })

  test('creation fails with proper statusCode and message if username is already taken', async () => {
    const usersAtStart = await getAllUsers()

    const newUser = {
      username: 'alaan1132test',
      name: 'AlanTest',
      password: 'passwordHash'
    }

    const result = await api
      .post('/api/v1/users/signup')
      .send(newUser)
      .expect(409)
      .expect('Content-Type', /application\/json/)

    expect(result.body.error.code).toBe(11000)
    const usersAtEnd = await getAllUsers()
    expect(usersAtStart).toHaveLength(usersAtEnd.length)
  })
})

describe('GET all users', () => {
  test('works as expected getting all users', async () => {
    const users = await getAllUsers()

    const testUsers = await api
      .get('/api/v1/users/')
      .expect(200)

    expect(testUsers.body).toHaveLength(users.length)
  })
})

afterAll(() => {
  mongoose.connection.close()
  server.close()
})
