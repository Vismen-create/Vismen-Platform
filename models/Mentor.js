const mongoose = require("mongoose");

const MentorSchema = new mongoose.Schema({
  name: String,
  title: String,
  company: String,
  tags: [String],
  image: String,
  email: { type: String, required: true },
  password: { type: String, required: true }
});

module.exports = mongoose.model("Mentor", MentorSchema);
