const express = require('express');
const router = express.Router();
const axios = require('axios');

// Middleware to check authentication
const isAuthenticated = (req, res, next) => {
  if (req.session && req.session.userId) {
    return next();
  }
  return res.status(401).json({ success: false, message: 'Unauthorized. Please log in.' });
};

// Sample music data (in real app, this would come from Spotify API or similar)
const sampleMusic = {
  featured: [
    {
      id: '1',
      title: 'Blinding Lights',
      artist: 'The Weeknd',
      album: 'After Hours',
      duration: 200,
      preview_url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
      image_url: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=300&h=300&fit=crop'
    },
    {
      id: '2',
      title: 'Shape of You',
      artist: 'Ed Sheeran',
      album: '÷ (Divide)',
      duration: 234,
      preview_url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
      image_url: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop'
    },
    {
      id: '3',
      title: 'Levitating',
      artist: 'Dua Lipa',
      album: 'Future Nostalgia',
      duration: 203,
      preview_url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
      image_url: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=300&h=300&fit=crop'
    },
    {
      id: '4',
      title: 'Watermelon Sugar',
      artist: 'Harry Styles',
      album: 'Fine Line',
      duration: 174,
      preview_url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3',
      image_url: 'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=300&h=300&fit=crop'
    },
    {
      id: '5',
      title: 'Good 4 U',
      artist: 'Olivia Rodrigo',
      album: 'SOUR',
      duration: 178,
      preview_url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3',
      image_url: 'https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=300&h=300&fit=crop'
    },
    {
      id: '6',
      title: 'Peaches',
      artist: 'Justin Bieber ft. Daniel Caesar, Giveon',
      album: 'Justice',
      duration: 198,
      preview_url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3',
      image_url: 'https://images.unsplash.com/photo-1487180144351-b8472da7d491?w=300&h=300&fit=crop'
    },
    {
      id: '7',
      title: 'Montero (Call Me By Your Name)',
      artist: 'Lil Nas X',
      album: 'MONTERO',
      duration: 137,
      preview_url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3',
      image_url: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=300&h=300&fit=crop'
    },
    {
      id: '8',
      title: 'Save Your Tears',
      artist: 'The Weeknd',
      album: 'After Hours',
      duration: 215,
      preview_url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3',
      image_url: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop'
    }
  ],
  trending: [
    {
      id: '9',
      title: 'Heat Waves',
      artist: 'Glass Animals',
      album: 'Dreamland',
      duration: 238,
      preview_url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-9.mp3',
      image_url: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=300&h=300&fit=crop'
    },
    {
      id: '10',
      title: 'Stay',
      artist: 'The Kid LAROI & Justin Bieber',
      album: 'F*CK LOVE 3+',
      duration: 141,
      preview_url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-10.mp3',
      image_url: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=300&h=300&fit=crop'
    }
  ]
};

// Get featured music
router.get('/featured', isAuthenticated, (req, res) => {
  try {
    res.json({ 
      success: true, 
      songs: sampleMusic.featured 
    });
  } catch (error) {
    console.error('Error fetching featured music:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching featured music',
      error: error.message 
    });
  }
});

// Get trending music
router.get('/trending', isAuthenticated, (req, res) => {
  try {
    res.json({ 
      success: true, 
      songs: sampleMusic.trending 
    });
  } catch (error) {
    console.error('Error fetching trending music:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching trending music',
      error: error.message 
    });
  }
});

// Search music
router.get('/search', isAuthenticated, (req, res) => {
  try {
    const query = req.query.q ? req.query.q.toLowerCase() : '';
    
    if (!query) {
      return res.status(400).json({ 
        success: false, 
        message: 'Search query is required' 
      });
    }

    const allSongs = [...sampleMusic.featured, ...sampleMusic.trending];
    const results = allSongs.filter(song => 
      song.title.toLowerCase().includes(query) ||
      song.artist.toLowerCase().includes(query) ||
      song.album.toLowerCase().includes(query)
    );

    res.json({ 
      success: true, 
      query,
      results 
    });
  } catch (error) {
    console.error('Error searching music:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error searching music',
      error: error.message 
    });
  }
});

// Get song by ID
router.get('/:id', isAuthenticated, (req, res) => {
  try {
    const allSongs = [...sampleMusic.featured, ...sampleMusic.trending];
    const song = allSongs.find(s => s.id === req.params.id);

    if (!song) {
      return res.status(404).json({ 
        success: false, 
        message: 'Song not found' 
      });
    }

    res.json({ 
      success: true, 
      song 
    });
  } catch (error) {
    console.error('Error fetching song:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching song',
      error: error.message 
    });
  }
});

module.exports = router;
