const express = require('express');
const logger = require('./loggerMiddleware');
let notes = require('./db');

const app = express();

app.use(express.json());
app.use(logger);

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
  res.json(notes);
});

app.get('/api/v1/notes/:id', (req, res) => {
  const id = Number(req.params.id);
  const note = notes.find((note) => note.id === id);
  if (note) res.json(note);
  else {
    res.status(404).json({
      error: 'Not Found',
    });
  }
});

app.delete('/api/v1/notes/:id', (req, res) => {
  const id = Number(req.params.id);
  notes = notes.filter((note) => note.id !== id);
  res.status(204).json({
    error: 'Not found 404',
  });
});

app.post('/api/v1/notes', (req, res) => {
  const note = req.body;

  if (!note || !note.body) {
    return res.status(400).json({
      error: 'note.body is missing',
    });
  }

  const ids = notes.map((note) => note.id);
  const maxId = Math.max(...ids);

  const newNote = {
    id: maxId + 1,
    content: note.body,
    date: new Date().toISOString(),
    important: typeof note.important !== undefined ? note.important : false,
  };

  notes = [newNote, ...notes];
  res.status(201).json(newNote);
});

app.use((_, res) => {
  res.status(404).json({
    error: 'Not found 404',
  });
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Server Running on Port: ${PORT}`);
});
