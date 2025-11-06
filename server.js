require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET || 'your_secret_key_change_in_production',
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
  }
}));

// MongoDB connection with better error handling
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/music_streaming_db')
.then(() => console.log('✅ MongoDB connected successfully'))
.catch((err) => {
  console.error('❌ MongoDB connection error:', err.message);
  console.log('⚠️  Server running WITHOUT database - using in-memory storage');
  console.log('💡 Install MongoDB or use MongoDB Atlas for full functionality');
});

// Import routes
const authRoutes = require('./routes/auth');
const playlistRoutes = require('./routes/playlists');
const musicRoutes = require('./routes/music');

// Use routes
app.use('/api/auth', authRoutes);
app.use('/api/playlists', playlistRoutes);
app.use('/api/music', musicRoutes);

// Serve HTML pages
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

app.get('/register', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'register.html'));
});

app.get('/dashboard', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'dashboard.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    success: false, 
    message: 'Something went wrong!', 
    error: err.message 
  });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🎵 Music Streaming Server running on http://localhost:${PORT}`);
  console.log(`📊 Database: ${process.env.MONGODB_URI || 'mongodb://localhost:27017/music_streaming_db'}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
});
