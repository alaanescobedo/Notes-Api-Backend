const mongoose = require('mongoose');
require('dotenv').config({ path: '.env' });
const cors = require('cors');
const express = require('express');
const logger = require('./loggerMiddleware');
const Note = require('./models/noteModel');
const app = express();

app.use(cors());
app.use(express.json());
app.use(logger);

//connect to mongodb
const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);

mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log('DB connection successful!'))
  .catch((err) => console.error(err));

app.get('/', (_, res) => {
  const content = `
  <div>
    <h1>Hello! Welcome to the Notes API</h1>
    <a href='/api/v1/notes'>Go to the notes</a>
  </div>
  `;

  res.send(content);
});

app.get('/api/v1/notes', (_, res) => {
  console.log(Note);
  Note.find({}).then((notes) => {
    res.json(notes);
  });
});

app.get('/api/v1/notes/:id', (req, res, next) => {
  const { id } = req.params;

  Note.findById(id)
    .then((note) => {
      if (note) res.json(note);
      else {
        res.status(404).json({
          error: 'Not Found',
        });
      }
    })
    .catch((err) => {
      console.error(err);
      next(err);
      res.status(400).end();
    });
});

app.delete('/api/v1/notes/:id', (req, res) => {
  const { id } = req.params;
  Note.findByIdAndRemove(id)
    .then(() => {
      res.status(204).end();
    })
    .catch((err) => {
      next(err);
      console.log(err);
    });
});

app.post('/api/v1/notes', (req, res) => {
  const note = req.body;

  if (!note || !note.content) {
    return res.status(400).json({
      error: 'note.content is missing',
    });
  }

  const newNote = new Note({
    content: note.content,
    date: new Date().toISOString(),
    important: typeof note.important !== undefined ? note.important : false,
  });

  newNote.save().then((savedNote) => {
    res.json(savedNote);
  });
});

app.patch('/api/v1/notes/:id', (req, res, next) => {
  const note = req.body;
  const newNoteInfo = {
    content: note.content,
    important: note.important,
  };

  Note.findByIdAndUpdate(req.params.id, newNoteInfo, {
    new: true,
  }).then((result) => {
    res.status(200).json(result);
  });
});

app.use((error, _, res, next) => {
  if (error.name === 'CastError') {
    res.status(400).send({ error: 'id use is malformed' });
  } else {
    res.status(500).end();
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server Running on Port: ${PORT}`);
});
