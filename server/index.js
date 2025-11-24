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
// This makes the 'uploads' folder publicly accessible for both audio and images
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// 4. MySQL Database Connection
const db = mysql.createPool({
  // Docker uses 'db' as the host name. Localhost is for running without Docker.
  host: process.env.DB_HOST || 'localhost', 
  user: 'root',
  // Use the environment variable if available, otherwise your local password
  password: process.env.DB_PASSWORD || '2212@AaryaTilak@1008@MysqlNew', 
  database: 'swarsetu1'
}).promise();


// 5. Multer Configuration (Handles File Uploads)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    // Create a unique filename
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });


// --- 6. API Endpoints ---

// --- AUTHENTICATION ENDPOINTS ---

// 1. SIGNUP: Create a new user
app.post('/signup', async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ error: "All fields are required" });
  }

  try {
    // Check if email already exists
    const [existingUser] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    if (existingUser.length > 0) {
      return res.status(400).json({ error: "Email already exists" });
    }

    // Insert new user
    const query = 'INSERT INTO users (name, email, password) VALUES (?, ?, ?)';
    await db.query(query, [name, email, password]);
    
    res.status(201).json({ message: "User registered successfully" });
  } catch (err) {
    console.error("Signup Error:", err);
    res.status(500).json({ error: "Server error during signup" });
  }
});

// 2. LOGIN: Check if user exists
app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    // Note: In production, use bcrypt to compare hashed passwords!
    const [users] = await db.query('SELECT * FROM users WHERE email = ? AND password = ?', [email, password]);
    
    if (users.length === 0) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const user = users[0];
    res.json({ message: "Login successful", user: { id: user.id, name: user.name, email: user.email } });
  } catch (err) {
    console.error("Login Error:", err);
    res.status(500).json({ error: "Server error during login" });
  }
});


// --- SONG ENDPOINTS ---

// A. Endpoint to UPLOAD a song (Audio + Optional Image + Category)
app.post('/upload', upload.fields([{ name: 'audio', maxCount: 1 }, { name: 'image', maxCount: 1 }]), async (req, res) => {
  // Get category from body
  const { title, artist, category } = req.body;
  
  if (!req.files || !req.files['audio']) {
    return res.status(400).json({ error: 'No audio file was uploaded.' });
  }
  
  const audioFilename = req.files['audio'][0].filename;
  const imageFilename = req.files['image'] ? req.files['image'][0].filename : null;

  if (!title || !artist || !category) {
    return res.status(400).json({ error: 'Title, Artist, and Category are required.' });
  }

  try {
    // Insert category into database
    const query = 'INSERT INTO songs (title, artist, filename, image_filename, category) VALUES (?, ?, ?, ?, ?)';
    await db.query(query, [title, artist, audioFilename, imageFilename, category]);
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

// C. Endpoint to DELETE a song
app.delete('/songs/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const [result] = await db.query('DELETE FROM songs WHERE id = ?', [id]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Song not found." });
    }

    res.json({ message: 'Song deleted successfully.' });
  } catch (err) {
    console.error("Database delete error:", err);
    res.status(500).json({ error: "Failed to delete song." });
  }
});

// --- LIKES ENDPOINTS ---

// 1. Toggle Like (Add or Remove)
app.post('/likes/toggle', async (req, res) => {
  const { userId, songId } = req.body;

  if (!userId || !songId) {
    return res.status(400).json({ error: "User ID and Song ID required" });
  }

  try {
    // Check if like exists
    const [existingLike] = await db.query(
      'SELECT * FROM user_likes WHERE user_id = ? AND song_id = ?', 
      [userId, songId]
    );

    if (existingLike.length > 0) {
      // If it exists, DELETE it (Unlike)
      await db.query('DELETE FROM user_likes WHERE user_id = ? AND song_id = ?', [userId, songId]);
      res.json({ message: "Unliked", liked: false });
    } else {
      // If not, INSERT it (Like)
      await db.query('INSERT INTO user_likes (user_id, song_id) VALUES (?, ?)', [userId, songId]);
      res.json({ message: "Liked", liked: true });
    }
  } catch (err) {
    console.error("Like Toggle Error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// 2. Get Liked Song IDs for a User
app.get('/likes/:userId', async (req, res) => {
  const { userId } = req.params;
  try {
    const [rows] = await db.query('SELECT song_id FROM user_likes WHERE user_id = ?', [userId]);
    // Return just an array of IDs, e.g., [101, 102, 16633...]
    const songIds = rows.map(row => row.song_id);
    res.json(songIds);
  } catch (err) {
    console.error("Fetch Likes Error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// 7. Start the Server
app.listen(port, () => {
  console.log(`✅ Server is running on http://localhost:${port}`);
});