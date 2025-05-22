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
  slots: [String], // e.g., ["Mon 7:00 PM", "Wed 8:30 PM", "Sat 9:00 AM"]
  resume: String,
  payout: String,
  payoutFrequency: String,
  availableSlots: [String],

});

module.exports = mongoose.model("Mentor", MentorSchema);
