const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema({
  content: {
    type: String,
    require: [true, 'Content must be required'],
    default: [true, 'New Post'],
  },
  date: {
    type: Date,
    default: Date.now(),
  },
  important: {
    type: Boolean,
    default: false,
  },
});

noteSchema.set('toJSON', {
  transform: (_, returnObject) => {
    returnObject.id = returnObject._id;
    delete returnObject._id;
    delete returnObject.__v;
  },
});

const Note = mongoose.model('Note', noteSchema);

module.exports = Note;
