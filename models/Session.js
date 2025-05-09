const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema({
  menteeEmail: String,
  mentorName: String,
  date: String,
  time: String,
  topic: String
});

module.exports = mongoose.model('Session', sessionSchema);
