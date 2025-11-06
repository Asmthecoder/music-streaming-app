// In-memory storage for when MongoDB is not available
const bcrypt = require('bcryptjs');

const storage = {
  users: [],
  playlists: [],
  
  // User methods
  async createUser(userData) {
    const user = {
      _id: Date.now().toString(),
      full_name: userData.full_name,
      email: userData.email.toLowerCase(),
      username: userData.username,
      password: await bcrypt.hash(userData.password, 10),
      created_at: new Date()
    };
    this.users.push(user);
    return user;
  },
  
  async findUserByEmail(email) {
    return this.users.find(u => u.email === email.toLowerCase());
  },
  
  async findUserByUsername(username) {
    return this.users.find(u => u.username === username);
  },
  
  async findUserByEmailOrUsername(identifier) {
    const lower = identifier.toLowerCase();
    return this.users.find(u => u.email === lower || u.username === identifier);
  },
  
  async findUserById(id) {
    return this.users.find(u => u._id === id);
  },
  
  async comparePassword(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword);
  },
  
  // Playlist methods
  async createPlaylist(playlistData) {
    const playlist = {
      _id: Date.now().toString(),
      name: playlistData.name,
      description: playlistData.description || '',
      user_id: playlistData.user_id,
      songs: [],
      is_public: playlistData.is_public || false,
      created_at: new Date(),
      updated_at: new Date()
    };
    this.playlists.push(playlist);
    return playlist;
  },
  
  async findPlaylistsByUserId(userId) {
    return this.playlists.filter(p => p.user_id === userId);
  },
  
  async findPlaylistById(id) {
    return this.playlists.find(p => p._id === id);
  },
  
  async updatePlaylist(id, updates) {
    const playlist = this.playlists.find(p => p._id === id);
    if (playlist) {
      Object.assign(playlist, updates);
      playlist.updated_at = new Date();
    }
    return playlist;
  },
  
  async deletePlaylist(id) {
    const index = this.playlists.findIndex(p => p._id === id);
    if (index !== -1) {
      this.playlists.splice(index, 1);
      return true;
    }
    return false;
  },
  
  async addSongToPlaylist(playlistId, song) {
    const playlist = this.playlists.find(p => p._id === playlistId);
    if (playlist) {
      playlist.songs.push({
        ...song,
        added_at: new Date()
      });
      playlist.updated_at = new Date();
    }
    return playlist;
  },
  
  async removeSongFromPlaylist(playlistId, songId) {
    const playlist = this.playlists.find(p => p._id === playlistId);
    if (playlist) {
      playlist.songs = playlist.songs.filter(s => s.song_id !== songId);
      playlist.updated_at = new Date();
    }
    return playlist;
  }
};

module.exports = storage;
