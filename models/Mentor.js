const mongoose = require("mongoose");

const MentorSchema = new mongoose.Schema({
  name: String,
  title: String,
  company: String,
  tags: [String],
  image: String,
  email: { type: String, required: true },
  password: { type: String, required: true },

  // Add these fields below:
  phone: String,
  languages: String,
  skills: String,
  experience: String,
  bio: String,
  resume: String,
  payout: String,
  payoutFrequency: String
});

module.exports = mongoose.model("Mentor", MentorSchema);
