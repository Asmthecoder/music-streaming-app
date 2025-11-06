const mongoose = require('mongoose');

const playlistSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Playlist name is required'],
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  songs: [{
    song_id: String,
    title: String,
    artist: String,
    album: String,
    duration: Number,
    preview_url: String,
    image_url: String,
    added_at: {
      type: Date,
      default: Date.now
    }
  }],
  is_public: {
    type: Boolean,
    default: false
  },
  created_at: {
    type: Date,
    default: Date.now
  },
  updated_at: {
    type: Date,
    default: Date.now
  }
});

// Update the updated_at timestamp before saving
playlistSchema.pre('save', function(next) {
  this.updated_at = Date.now();
  next();
});

module.exports = mongoose.model('Playlist', playlistSchema);
