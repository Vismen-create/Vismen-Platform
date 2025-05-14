const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema({
  menteeEmail: String,
  mentorName: String,
  date: String,
  time: String,
  topic: String,
  status: {
    type: String,
    enum: ['upcoming', 'completed', 'canceled'],
    default: 'upcoming'
  }
});

module.exports = mongoose.model('Session', sessionSchema);
