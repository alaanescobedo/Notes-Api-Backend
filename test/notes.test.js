const moongose = require('mongoose')
const server = require('../server')
const Note = require('../models/noteModel')
const { api, initialNotes, getUser, getAllContentsFromNotes } = require('./helpers')
require('events').EventEmitter.defaultMaxListeners = 15

beforeEach(async () => {
  await Note.deleteMany({})
  const user = await getUser()

  for (const note of initialNotes) {
    const noteObj = new Note(note)
    noteObj.user = user.id
    await noteObj.save()
  }
})

describe('GET /', () => {
  test('notes are returned as json', async () => {
    await api
      .get('/api/v1/notes')
      .expect(200)
      .expect('Content-Type', /application\/json/)
  })

  test('there are two notes', async () => {
    const response = await api.get('/api/v1/notes')
    expect(response.body).toHaveLength(initialNotes.length)
  })

  test('the first note is about html', async () => {
    const { contents } = await getAllContentsFromNotes()
    expect(contents).toContain('HTML is easy')
  })
})

describe('POST /', () => {
  test('a valid note can be added', async () => {
    const user = await getUser()

    const newNote = {
      content: 'Soon async/await',
      importan: true,
      userId: user.id
    }

    await api
      .post('/api/v1/notes')
      .send(newNote)
      .expect(200)
      .expect('Content-Type', /application\/json/)

    const { response, contents } = await getAllContentsFromNotes()
    expect(response.body).toHaveLength(initialNotes.length + 1)
    expect(contents).toContain(newNote.content)
  })

  test('note without content is not added', async () => {
    const newNote = {
      importan: true
    }
    await api
      .post('/api/v1/notes')
      .send(newNote)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    const response = await api.get('/api/v1/notes')
    expect(response.body).toHaveLength(initialNotes.length)
  })
})

describe('DELETE /:id', () => {
  test('a note can be deleted', async () => {
    const { response: firstResponse } = await getAllContentsFromNotes()
    const { body: note } = firstResponse
    const noteToDelete = note[0]

    await api
      .delete(`/api/v1/notes/${noteToDelete.id}`)
      .expect(204)

    const { contents, response: secondResponse } = await getAllContentsFromNotes()
    expect(secondResponse.body).toHaveLength(initialNotes.length - 1)
    expect(contents).not.toContain(noteToDelete.content)
  })

  test('a note that do not exist can not be deleted', async () => {
    await api
      .delete('/api/v1/notes/123123')
      .expect(400)

    const { response } = await getAllContentsFromNotes()
    expect(response.body).toHaveLength(initialNotes.length)
  })
})

afterAll(() => {
  moongose.connection.close()
  server.close()
})
