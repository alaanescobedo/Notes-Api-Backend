const mongoose = require('mongoose')
require('dotenv').config({ path: './.env' })
const app = require('./app')

process.on('uncaughtException', err => {
  console.log('UNCAUGHT EXCEPTION! 💥 Shutting down...')
  console.log(err.name, err.message)
  process.exit(1)
})

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

const PORT = process.env.PORT || 3001
const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})

module.exports = server
