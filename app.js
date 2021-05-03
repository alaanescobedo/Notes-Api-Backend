const mongoose = require('mongoose')
require('dotenv').config({ path: './.env' })

const Sentry = require('@sentry/node')
const Tracing = require('@sentry/tracing')
const cors = require('cors')
const express = require('express')
const logger = require('./loggerMiddleware')
const Note = require('./models/noteModel')
const handleErrors = require('./middlewares/handleErrors')
const userRouter = require('./routes/userRoutes')

const app = express()

process.on('uncaughtException', err => {
  console.log('UNCAUGHT EXCEPTION! 💥 Shutting down...')
  console.log(err.name, err.message)
  process.exit(1)
})

app.use(cors())
app.use(express.json())
app.use(logger)

Sentry.init({
  dsn: 'https://6a8d313b279246469771f7fdcc696a90@o603236.ingest.sentry.io/5744508',
  integrations: [
    // enable HTTP calls tracing
    new Sentry.Integrations.Http({ tracing: true }),
    // enable Express.js middleware tracing
    new Tracing.Integrations.Express({ app })
  ],

  // Set tracesSampleRate to 1.0 to capture 100%
  // of transactions for performance monitoring.
  // We recommend adjusting this value in production
  tracesSampleRate: 1.0
})

// RequestHandler creates a separate execution context using domains, so that every
// transaction/span/breadcrumb is attached to its own Hub instance
app.use(Sentry.Handlers.requestHandler())
// TracingHandler creates a trace for every incoming request
app.use(Sentry.Handlers.tracingHandler())

// connect to mongodb
const { DATABASE, DATABASE_TEST, NODE_ENV } = process.env
const DB = NODE_ENV === 'test' ? DATABASE_TEST : DATABASE

const connectionDB = DB.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
)
mongoose
  .connect(connectionDB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true
  })
  .then(() => console.log('DB connection successful!'))
  .catch((err) => console.error(err))

app.get('/', (_, res) => {
  const content = `
  <div>
    <h1>Hello! Welcome to the Notes API</h1>
    <a href='/api/v1/notes'>Go to the notes</a>
  </div>
  `

  res.send(content)
})

app.get('/api/v1/notes', (_, res) => {
  Note.find({}).then((notes) => {
    res.json(notes)
  })
})

app.get('/api/v1/notes/:id', (req, res, next) => {
  const { id } = req.params

  Note.findById(id)
    .then((note) => {
      if (note) res.json(note)
      else {
        res.status(404).json({
          error: 'Not Found'
        })
      }
    })
    .catch((err) => {
      next(err)
      res.status(400).end()
    })
})

app.delete('/api/v1/notes/:id', async (req, res, next) => {
  try {
    const { id } = req.params
    await Note.findByIdAndDelete(id)
    res.status(204).end()
  } catch (error) {
    next(error)
  }
})

app.post('/api/v1/notes', (req, res) => {
  const note = req.body

  if (!note || !note.content) {
    return res.status(400).json({
      error: 'note.content is missing'
    })
  }

  const newNote = new Note({
    content: note.content,
    date: new Date().toISOString(),
    important: typeof note.important !== 'undefined' ? note.important : false
  })

  newNote.save().then((savedNote) => {
    res.json(savedNote)
  })
})

app.patch('/api/v1/notes/:id', (req, res, next) => {
  const note = req.body
  const newNoteInfo = {
    content: note.content,
    important: note.important
  }

  Note.findByIdAndUpdate(req.params.id, newNoteInfo, {
    new: true
  }).then((result) => {
    res.status(200).json(result)
  })
})

app.use((error, _, res, next) => {
  if (error.name === 'CastError') {
    res.status(400).send({ error: 'id use is malformed' })
  } else {
    res.status(500).end()
  }
})

app.use('/api/v1/users', userRouter)

// The error handler must be before any other error middleware and after all controllers
app.use(Sentry.Handlers.errorHandler())
app.use(handleErrors)

const PORT = process.env.PORT || 8001

if (process.env.NODE_ENV !== 'test') {
  const server = app.listen(PORT, () => {
    console.log(`Server Running on Port: ${PORT}`)
  })
  module.exports = { app, server }
}

module.exports = { app }
