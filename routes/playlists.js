const express = require('express');
const router = express.Router();
const Playlist = require('../models/Playlist');
const storage = require('../storage');
const mongoose = require('mongoose');

// Check if MongoDB is connected
function isMongoConnected() {
  return mongoose.connection.readyState === 1;
}

// Middleware to check authentication
const isAuthenticated = (req, res, next) => {
  if (req.session && req.session.userId) {
    return next();
  }
  return res.status(401).json({ success: false, message: 'Unauthorized. Please log in.' });
};

// Get all playlists for logged-in user
router.get('/', isAuthenticated, async (req, res) => {
  try {
    let playlists;
    
    if (isMongoConnected()) {
      playlists = await Playlist.find({ user_id: req.session.userId })
        .sort({ updated_at: -1 });
    } else {
      playlists = storage.getUserPlaylists(req.session.userId);
    }
    
    res.json({ 
      success: true, 
      playlists 
    });
  } catch (error) {
    console.error('Error fetching playlists:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching playlists',
      error: error.message 
    });
  }
});

// Get a specific playlist
router.get('/:id', isAuthenticated, async (req, res) => {
  try {
    let playlist;
    
    if (isMongoConnected()) {
      playlist = await Playlist.findOne({
        _id: req.params.id,
        user_id: req.session.userId
      });
    } else {
      playlist = storage.getPlaylist(req.params.id, req.session.userId);
    }

    if (!playlist) {
      return res.status(404).json({ 
        success: false, 
        message: 'Playlist not found' 
      });
    }

    res.json({ 
      success: true, 
      playlist 
    });
  } catch (error) {
    console.error('Error fetching playlist:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching playlist',
      error: error.message 
    });
  }
});

// Create a new playlist
router.post('/', isAuthenticated, async (req, res) => {
  try {
    const { name, description, is_public } = req.body;

    if (!name || name.trim() === '') {
      return res.status(400).json({ 
        success: false, 
        message: 'Playlist name is required' 
      });
    }

    let newPlaylist;
    
    if (isMongoConnected()) {
      newPlaylist = new Playlist({
        name: name.trim(),
        description: description ? description.trim() : '',
        user_id: req.session.userId,
        is_public: is_public || false,
        songs: []
      });
      await newPlaylist.save();
    } else {
      newPlaylist = storage.createPlaylist(
        req.session.userId,
        name.trim(),
        description ? description.trim() : '',
        is_public || false
      );
    }

    res.status(201).json({ 
      success: true, 
      message: 'Playlist created successfully',
      playlist: newPlaylist 
    });
  } catch (error) {
    console.error('Error creating playlist:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error creating playlist',
      error: error.message 
    });
  }
});

// Update a playlist
router.put('/:id', isAuthenticated, async (req, res) => {
  try {
    const { name, description, is_public } = req.body;

    let playlist;
    
    if (isMongoConnected()) {
      playlist = await Playlist.findOne({
        _id: req.params.id,
        user_id: req.session.userId
      });

      if (!playlist) {
        return res.status(404).json({ 
          success: false, 
          message: 'Playlist not found' 
        });
      }

      if (name) playlist.name = name.trim();
      if (description !== undefined) playlist.description = description.trim();
      if (is_public !== undefined) playlist.is_public = is_public;

      await playlist.save();
    } else {
      playlist = storage.updatePlaylist(
        req.params.id,
        req.session.userId,
        name ? name.trim() : undefined,
        description !== undefined ? description.trim() : undefined,
        is_public
      );
      
      if (!playlist) {
        return res.status(404).json({ 
          success: false, 
          message: 'Playlist not found' 
        });
      }
    }

    res.json({ 
      success: true, 
      message: 'Playlist updated successfully',
      playlist 
    });
  } catch (error) {
    console.error('Error updating playlist:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error updating playlist',
      error: error.message 
    });
  }
});

// Delete a playlist
router.delete('/:id', isAuthenticated, async (req, res) => {
  try {
    let playlist;
    
    if (isMongoConnected()) {
      playlist = await Playlist.findOneAndDelete({
        _id: req.params.id,
        user_id: req.session.userId
      });
    } else {
      playlist = storage.deletePlaylist(req.params.id, req.session.userId);
    }

    if (!playlist) {
      return res.status(404).json({ 
        success: false, 
        message: 'Playlist not found' 
      });
    }

    res.json({ 
      success: true, 
      message: 'Playlist deleted successfully' 
    });
  } catch (error) {
    console.error('Error deleting playlist:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error deleting playlist',
      error: error.message 
    });
  }
});

// Add a song to playlist
router.post('/:id/songs', isAuthenticated, async (req, res) => {
  try {
    const { song_id, title, artist, album, duration, preview_url, image_url } = req.body;

    let playlist;
    
    if (isMongoConnected()) {
      playlist = await Playlist.findOne({
        _id: req.params.id,
        user_id: req.session.userId
      });

      if (!playlist) {
        return res.status(404).json({ 
          success: false, 
          message: 'Playlist not found' 
        });
      }

      // Check if song already exists in playlist
      const songExists = playlist.songs.some(song => song.song_id === song_id);
      if (songExists) {
        return res.status(400).json({ 
          success: false, 
          message: 'Song already in playlist' 
        });
      }

      playlist.songs.push({
        song_id,
        title,
        artist,
        album,
        duration,
        preview_url,
        image_url
      });

      await playlist.save();
    } else {
      const songData = {
        song_id,
        title,
        artist,
        album,
        duration,
        preview_url,
        image_url
      };
      
      const result = storage.addSongToPlaylist(req.params.id, req.session.userId, songData);
      
      if (!result.success) {
        if (result.message === 'Playlist not found') {
          return res.status(404).json({ 
            success: false, 
            message: result.message 
          });
        }
        return res.status(400).json({ 
          success: false, 
          message: result.message 
        });
      }
      
      playlist = result.playlist;
    }

    res.json({ 
      success: true, 
      message: 'Song added to playlist',
      playlist 
    });
  } catch (error) {
    console.error('Error adding song to playlist:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error adding song to playlist',
      error: error.message 
    });
  }
});

// Remove a song from playlist
router.delete('/:id/songs/:songId', isAuthenticated, async (req, res) => {
  try {
    let playlist;
    
    if (isMongoConnected()) {
      playlist = await Playlist.findOne({
        _id: req.params.id,
        user_id: req.session.userId
      });

      if (!playlist) {
        return res.status(404).json({ 
          success: false, 
          message: 'Playlist not found' 
        });
      }

      playlist.songs = playlist.songs.filter(song => song.song_id !== req.params.songId);
      await playlist.save();
    } else {
      const result = storage.removeSongFromPlaylist(req.params.id, req.session.userId, req.params.songId);
      
      if (!result.success) {
        return res.status(404).json({ 
          success: false, 
          message: result.message 
        });
      }
      
      playlist = result.playlist;
    }

    res.json({ 
      success: true, 
      message: 'Song removed from playlist',
      playlist 
    });
  } catch (error) {
    console.error('Error removing song from playlist:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error removing song from playlist',
      error: error.message 
    });
  }
});

module.exports = router;
