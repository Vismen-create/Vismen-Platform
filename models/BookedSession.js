const mongoose = require('mongoose');

const bookedSessionSchema = new mongoose.Schema({
  menteeEmail: String,
  mentorEmail: String,
  mentorName: String,
  dateTime: String,
  sessionType: String,
  problemDescription: String,
  fileName: String,
  paymentMode: String
});

module.exports = mongoose.model('BookedSession', bookedSessionSchema);
