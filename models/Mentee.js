const mongoose = require('mongoose');

const menteeSchema = new mongoose.Schema({
  fullname: String,
  email: String,
  mobile: String,
  password: String
});

module.exports = mongoose.model('Mentee', menteeSchema);
