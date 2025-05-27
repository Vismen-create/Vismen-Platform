require('dotenv').config();
const mongoose = require('mongoose');
const express = require('express');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const cors = require('cors');

const app = express();
// const PORT = 3000;

const mentorsFile = path.join(__dirname, 'data', 'mentors.json');
const menteesFile = path.join(__dirname, 'data', 'mentees.json');

// Model imports

const Mentor = require('./models/Mentor');
const Mentee = require('./models/Mentee');
const Session = require('./models/Session');

// CORS setup

const cors = require('cors');
app.use(cors({
  origin: ['https://www.vismen.com'], // include the www domain
  credentials: true
}));


// Multer storage setup

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/uploads');
  },
  filename: function (req, file, cb) {
    const uniqueName = Date.now() + '-' + file.originalname;
    cb(null, uniqueName);
  }
});
const upload = multer({ storage });

// Middleware

app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());



// MongoDB Connection

console.log("Connecting to MongoDB with URI:", process.env.MONGO_URI);

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log("✅ Connected to MongoDB Atlas");
}).catch((err) => {
  console.error("❌ MongoDB connection error:", err);
});

// Mentor Signup with file upload
app.post("/api/mentors", upload.single("image"), async (req, res) => {
  try {
    const { name, title, company, tags, email, password } = req.body;
    if (!req.file) return res.status(400).json({ error: "Image upload failed." });

    const newMentor = new Mentor({
      name,
      title,
      company,
      tags: tags.split(',').map(t => t.trim()),
      email,
      password,
      image: `/uploads/${req.file.filename}`
    });
    await newMentor.save();
    res.status(201).json({ message: "Mentor registered successfully." });
  } catch (err) {
    console.error("❌ Error saving mentor:", err);
    res.status(500).json({ error: "Server error while saving mentor." });
  }
});



app.get('/api/mentors', async (req, res) => {
  try {
    const mentors = await Mentor.find({});
    res.json(mentors);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch mentors' });
  }
});

// Fetch all mentors
app.get('/api/mentors', async (req, res) => {
  try {
    const mentors = await Mentor.find();
    const formatted = mentors.map(m => ({
      name: m.name,
      title: m.title,
      company: m.company,
      tags: m.tags,
      image: m.image,
      email: m.email
    }));
    res.json(formatted);
  } catch (err) {
    console.error("❌ Error loading mentors from DB:", err);
    res.status(500).json({ error: "Failed to load mentors." });
  }
});

// ✅ Mentor Signup (legacy JSON file)
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
app.post('/login', async (req, res) => {
  let { email, password, role } = req.body;
  email = email.trim().toLowerCase();
  password = password.trim();

  try {
    if (role.toLowerCase() === 'mentor') {
      const mentor = await Mentor.findOne({ email, password });
      console.log("🧠 Mentor Login Attempt:", mentor);
      return res.json({
        success: !!mentor,
        email,
        name: mentor?.name || ''
      });
    } else if (role.toLowerCase() === 'mentee') {
      const mentee = await Mentee.findOne({ email, password });
      console.log("🧠 Mentee Login Attempt:", mentee);
      return res.json({
        success: !!mentee,
        email,
        name: mentee?.fullname || ''
      });
    } else {
      return res.status(400).json({ error: "Invalid role" });
    }
  } catch (err) {
    console.error("❌ Login error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ✅ Get Mentor Data by Email
app.get('/get-mentor-data', async (req, res) => {
  try {
    const email = (req.query.email || '').trim();
    if (!email) return res.status(400).json({ error: "Email is required" });

    const mentor = await Mentor.findOne({ email: { $regex: new RegExp(`^${email}$`, 'i') } });
    if (!mentor) return res.status(404).json({ error: "Mentor not found" });

    res.json({
      name: mentor.name,
      email: mentor.email,
      title: mentor.title,
      company: mentor.company,
      image: mentor.image,
      availableSlots: mentor.availableSlots
    });
  } catch (err) {
    console.error("Error fetching mentor:", err);
    res.status(500).json({ error: "Server error" });
  }
});




// ✅ Get Mentee by Email
app.get('/get-mentee-data', async (req, res) => {
  try {
    const mentee = await Mentee.findOne({ email: req.query.email });
    if (!mentee) return res.status(404).json({ error: 'Mentee not found' });
    res.json(mentee);
  } catch (err) {
    console.error("❌ Error fetching mentee:", err);
    res.status(500).json({ error: 'Server error' });
  }
});

// ✅ Book Session
app.post('/book-session', async (req, res) => {
  try {
    const session = new Session(req.body);
    await session.save();
    res.json({ success: true });
  } catch (err) {
    console.error("❌ Booking Error:", err);
    res.status(500).json({ success: false, error: 'Booking failed' });
  }
});

// ✅ Get Sessions by Mentee Email
app.get('/get-mentee-sessions', async (req, res) => {
  try {
    const sessions = await Session.find({ menteeEmail: req.query.email });
    res.json(sessions);
  } catch (err) {
    console.error("❌ Error fetching sessions:", err);
    res.status(500).json({ error: 'Failed to retrieve sessions' });
  }
});





// Cancel a session
app.post('/cancel-session', async (req, res) => {
  const { id } = req.body;

  try {
    const result = await Session.findByIdAndUpdate(id, { status: 'canceled' });
    if (!result) {
      return res.status(404).json({ success: false, error: 'Session not found' });
    }

    res.json({ success: true });
  } catch (err) {
    console.error("❌ Error canceling session:", err);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// Get mentor sessions by mentor name
app.get('/mentor-sessions', async (req, res) => {
  const { mentorName } = req.query;
  try {
    const sessions = await Session.find({ mentorName });
    res.json(sessions);
  } catch (err) {
    console.error("❌ Error fetching sessions:", err);
    res.status(500).json({ error: 'Error fetching sessions' });
  }
});


// Get mentor profile by email
app.get('/get-mentor-profile', async (req, res) => {
  const email = req.query.email;
  if (!email) return res.status(400).json({ error: 'Email is required' });

  try {
    const mentor = await Mentor.findOne({ email });
    if (!mentor) return res.status(404).json({ error: 'Mentor not found' });

    res.json(mentor);
  } catch (err) {
    console.error("Error fetching mentor profile:", err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.post("/update-mentor-profile", async (req, res) => {
  try {
    const {
      email, phone, languages, skills,
      experience, bio, resume,
      payout, payoutFrequency, availableSlots
    } = req.body;

    if (!email) return res.status(400).json({ error: "Email is required" });

    const updateFields = {
      phone,
      languages,
      skills,
      experience,
      bio,
      resume,
      payout,
      payoutFrequency,
      availableSlots
    };

    const updated = await Mentor.findOneAndUpdate(
      { email },
      updateFields,
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ error: "Mentor not found" });
    }

    // ✅ Don't send anything after this line
    return res.json({ message: "✅ Profile updated successfully" });

  } catch (err) {
    console.error("Update error:", err);
    if (!res.headersSent) {
      return res.status(500).json({ error: "Update failed" });
    }
  }
});

//sessions by mentor email
app.get('/get-sessions-by-mentor', async (req, res) => {
  try {
    const { mentorName } = req.query;
    if (!mentorName) return res.status(400).json({ error: 'Mentor name required' });

    const sessions = await Session.find({ mentorName });

    res.json(sessions);
  } catch (err) {
    console.error("Error fetching sessions:", err);
    res.status(500).json({ error: 'Failed to fetch sessions' });
  }
});


// ✅ Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Server is running at http://localhost:${PORT}`);
});
