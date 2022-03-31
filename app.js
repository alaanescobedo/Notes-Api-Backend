const Sentry = require('@sentry/node')
const Tracing = require('@sentry/tracing')
const cors = require('cors')
const express = require('express')
const logger = require('./loggerMiddleware')
const Note = require('./models/noteModel')
const notFound = require('./middlewares/notFound')
const homeRoutes = require('./routes/homeRoutes')
const noteRoutes = require('./routes/noteRoutes')
const userRoutes = require('./routes/userRoutes')
const testingRoutes = require('./routes/testingRoutes')
const globalErrorHandler = require('./controllers/errorController')

const app = express()

app.use(cors())
app.use(express.json())
app.use(logger)

Sentry.init({
  dsn:
    'https://6a8d313b279246469771f7fdcc696a90@o603236.ingest.sentry.io/5744508',
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

app.get('/', homeRoutes)
app.use('/api/v1/notes', noteRoutes)
app.use('/api/v1/users', userRoutes)
if (process.env.NODE_ENV === 'test') {
  console.log('hi')
  app.use('/api/v1/testing', testingRoutes)
}

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
app.use(notFound)
// The error handler must be before any other error middleware and after all controllers
// app.use(Sentry.Handlers.errorHandler())
app.use(globalErrorHandler)

module.exports = app
