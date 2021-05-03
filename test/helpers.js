const supertest = require('supertest')
const { app } = require('../app')

const api = supertest(app)

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

const getAllContentsFromNotes = async () => {
  const response = await api.get('/api/v1/notes')
  return {
    response,
    contents: response.body.map(note => note.content)
  }
}
module.exports = {
  api,
  initialNotes,
  getAllContentsFromNotes
}
