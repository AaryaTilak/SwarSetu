// 1. Import Packages
const express = require('express');
const mysql = require('mysql2');
const multer = require('multer');
const cors = require('cors');
const path = require('path');

// 2. Initialize App
const app = express();
const port = 4000;

// 3. Setup Middleware
app.use(cors());
app.use(express.json());
// This makes the 'uploads' folder publicly accessible
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// 4. MySQL Database Connection
// We use a pool for better performance and connection management.
const db = mysql.createPool({
  host: 'localhost',
  user: 'root',             // Your MySQL username
  password: 'your_password',    // <-- IMPORTANT: Change this to your MySQL password
  database: 'music_app'
}).promise();

// 5. Multer Configuration (Handles File Uploads)
const storage = multer.diskStorage({
  // Tell Multer where to save the files
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  // Create a unique filename to prevent files with the same name from overwriting each other
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

// --- 6. API Endpoints ---

// A. Endpoint to UPLOAD a song
// It uses the 'upload' middleware to handle a single file upload from a field named 'audio'
app.post('/upload', upload.single('audio'), async (req, res) => {
  const { title, artist } = req.body;
  
  if (!req.file) {
    return res.status(400).json({ error: 'No audio file was uploaded.' });
  }
  
  const filename = req.file.filename;

  if (!title || !artist) {
    return res.status(400).json({ error: 'Title and Artist are required fields.' });
  }

  try {
    const query = 'INSERT INTO songs (title, artist, filename) VALUES (?, ?, ?)';
    await db.query(query, [title, artist, filename]);
    res.status(201).json({ message: `Song '${title}' uploaded successfully!` });
  } catch (err) {
    console.error("Database upload error:", err);
    res.status(500).json({ error: "Failed to save song to the database." });
  }
});

// B. Endpoint to GET all songs from the database
app.get('/songs', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM songs ORDER BY id DESC');
    res.json(rows);
  } catch (err) {
    console.error("Database fetch error:", err);
    res.status(500).json({ error: "Failed to fetch songs." });
  }
});

// 7. Start the Server
app.listen(port, () => {
  console.log(`✅ Server is running on http://localhost:${port}`);
});