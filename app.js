require('dotenv').config();
const mongoose = require('mongoose');


const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 3000;

const mentorsFile = path.join(__dirname, 'data', 'mentors.json');
const menteesFile = path.join(__dirname, 'data', 'mentees.json');
const Mentee = require('./models/Mentee'); // 


app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());


// const mongoose = require('mongoose');

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log("✅ Connected to MongoDB Atlas");
}).catch((err) => {
  console.error("❌ MongoDB connection error:", err);
});



  const Mentor = require('./models/Mentor'); // 👈 Import the model

// ✅ Save mentor to MongoDB
app.post("/api/mentors", async (req, res) => {
  const { name, title, company, tags, image } = req.body;

  try {
    const { name, title, company, tags, image, email, password } = req.body;

    const newMentor = new Mentor({
      name,
      title,
      company,
      tags: tags.split(',').map(tag => tag.trim()),
      image,
      email,
      password
    });

    await newMentor.save();
    res.status(201).json({ message: "Mentor registered successfully!" });
  } catch (err) {
    console.error("❌ Error saving mentor:", err);
    res.status(500).json({ error: "Server error while saving mentor." });
  }
});


app.get("/api/mentors", async (req, res) => {
  try {
    const mentors = await Mentor.find();
    res.json(mentors);
  } catch (err) {
    res.status(500).json({ error: "Failed to load mentors." });
  }
});



// ✅ Mentor Signup
app.post('/mentor-signup', (req, res) => {
  const newMentor = req.body;

  fs.readFile(mentorsFile, 'utf8', (err, data) => {
    const mentors = data ? JSON.parse(data) : [];
    const exists = mentors.find(m => m.email === newMentor.email);

    if (exists) {
      return res.send(`<script>alert("Mentor already registered."); window.location.href = "/MentorSignup.html";</script>`);
    }

    mentors.push(newMentor);
    fs.writeFile(mentorsFile, JSON.stringify(mentors, null, 2), err => {
      if (err) return res.status(500).send("Server error");
      res.send(`<script>alert("Signup successful! Please login."); window.location.href = "/login.html";</script>`);
    });
  });
});


// ✅ Mentee Signup
app.post('/mentee-signup', async (req, res) => {
  const { fullname, email, mobile, password } = req.body;

  try {
    const exists = await Mentee.findOne({ email });
    if (exists) {
      return res.send(`<script>alert("Mentee already registered."); window.location.href = "/MenteeSignup.html";</script>`);
    }

    const newMentee = new Mentee({
      fullname,
      email: email.toLowerCase().trim(),
      mobile,
      password: password.trim()
    });
    
    await newMentee.save();

    console.log("✅ Mentee saved:", newMentee);
    res.send(`<script>alert("Signup successful! Please login."); window.location.href = "/login.html";</script>`);
  } catch (err) {
    console.error("❌ Error saving mentee:", err.message);
    res.status(500).send("Server error while saving mentee: " + err.message);
  }
  
});


// ✅ Login
// ✅ Login using MongoDB for Mentors
app.post('/login', async (req, res) => {
  let { email, password, role } = req.body;
  email = email.trim().toLowerCase();
  password = password.trim();

  try {
    if (role.toLowerCase() === 'mentor') {
      const mentor = await Mentor.findOne({ email, password });
      console.log("🧠 Mentor Login Attempt:", mentor);
      if (mentor) {
        return res.json({ success: true, email });
      } else {
        return res.json({ success: false });
      }
    } else if (role.toLowerCase() === 'mentee') {
      const mentee = await Mentee.findOne({ email, password });
      console.log("🧠 Mentee Login Attempt:", mentee);
      if (mentee) {
        return res.json({ success: true, email });
      } else {
        return res.json({ success: false });
      }
    } else {
      return res.status(400).json({ error: "Invalid role" });
    }
  } catch (err) {
    console.error("❌ Login error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get Mentor Data by Email (from MongoDB)
app.get('/get-mentor-data', async (req, res) => {
  const email = req.query.email;

  try {
    const mentor = await Mentor.findOne({ email });

    if (!mentor) {
      return res.status(404).json({ error: 'Mentor not found' });
    }

    res.json(mentor);
  } catch (err) {
    console.error("❌ Error fetching mentor:", err);
    res.status(500).json({ error: 'Server error' });
  }
});


// ✅ Get All Mentors from MongoDB
app.get("/api/mentors", async (req, res) => {
  try {
    const mentors = await Mentor.find();

    const formatted = mentors.map(m => ({
      name: m.name,
      title: m.title,
      company: m.company,
      tags: m.tags,
      image: m.image
    }));

    res.json(formatted);
  } catch (err) {
    console.error("❌ Error loading mentors from DB:", err);
    res.status(500).json({ error: "Failed to load mentors." });
  }
});


// ✅ Start the server
app.listen(PORT, () => {
  console.log(`✅ Server is running at: http://localhost:${PORT}`);
});
