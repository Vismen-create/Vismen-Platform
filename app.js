const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 3000;
const mentorsFile = path.join(__dirname, 'data', 'mentors.json');

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Handle mentor signup
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

// Handle login
app.post('/login', (req, res) => {
  const { email, password, role } = req.body;
  const dataFile = role === 'Mentor' ? mentorsFile : menteesFile;

  fs.readFile(dataFile, 'utf8', (err, data) => {
    if (err) return res.status(500).json({ error: 'Server error' });

    const users = data ? JSON.parse(data) : [];
    const match = users.find(u => u.email === email && u.password === password);

    if (match) {
      res.json({ success: true, email });
    } else {
      res.json({ success: false });
    }
  });
});





// ✅ Get Mentor Data by Email (for dynamic dashboard)
app.get('/get-mentor-data', (req, res) => {
  const email = req.query.email;

  fs.readFile(mentorsFile, 'utf8', (err, data) => {
    if (err) return res.status(500).json({ error: 'Server error' });

    const mentors = JSON.parse(data || '[]');
    const mentor = mentors.find(m => m.email === email);

    if (mentor) {
      res.json(mentor);
    } else {
      res.status(404).json({ error: 'Mentor not found' });
    }
  });
});


const menteesFile = path.join(__dirname, 'data', 'mentees.json');

// Handle mentee signup
app.post('/mentee-signup', (req, res) => {
  const newMentee = req.body;

  fs.readFile(menteesFile, 'utf8', (err, data) => {
    const mentees = data ? JSON.parse(data) : [];
    const exists = mentees.find(m => m.email === newMentee.email);

    if (exists) {
      return res.send(`<script>alert("Mentee already registered."); window.location.href = "/MenteeSignup.html";</script>`);
    }

    mentees.push(newMentee);
    fs.writeFile(menteesFile, JSON.stringify(mentees, null, 2), err => {
      if (err) return res.status(500).send("Server error");
      res.send(`<script>alert("Signup successful! Please login."); window.location.href = "/login.html";</script>`);
    });
  });
});

// Get Mentee Data by Email
app.get('/get-mentee-data', (req, res) => {
  const email = req.query.email;

  fs.readFile(menteesFile, 'utf8', (err, data) => {
    if (err) return res.status(500).json({ error: 'Server error' });

    const mentees = JSON.parse(data || '[]');
    const mentee = mentees.find(m => m.email === email);

    if (mentee) {
      res.json(mentee);
    } else {
      res.status(404).json({ error: 'Mentee not found' });
    }
  });
});


// Start the server
app.listen(PORT, () => {
  console.log(`✅ Server is running at: http://localhost:${PORT}`);
});
