// Dashboard functionality
let currentUser = null;
let playlists = [];
let currentSong = null;
let allSongs = [];
let selectedSongForPlaylist = null;

// Check authentication on load
document.addEventListener('DOMContentLoaded', async () => {
    await checkAuth();
    await loadFeaturedMusic();
    await loadPlaylists();
    setupEventListeners();
});

// Check if user is authenticated
async function checkAuth() {
    try {
        const response = await fetch('/api/auth/check');
        const data = await response.json();
        
        if (!data.success || !data.authenticated) {
            window.location.href = '/login';
            return;
        }
        
        currentUser = data.user;
        document.getElementById('user-name').textContent = currentUser.full_name;
    } catch (error) {
        console.error('Auth check error:', error);
        window.location.href = '/login';
    }
}

// Logout function
async function logout() {
    try {
        await fetch('/api/auth/logout', { method: 'POST' });
        window.location.href = '/';
    } catch (error) {
        console.error('Logout error:', error);
    }
}

// Setup event listeners
function setupEventListeners() {
    // Menu navigation
    document.querySelectorAll('.menu-item').forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const section = item.dataset.section;
            switchSection(section);
        });
    });

    // Search input
    document.getElementById('search-input').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            searchMusic();
        }
    });

    // Create playlist form
    document.getElementById('create-playlist-form').addEventListener('submit', createPlaylist);
}

// Switch between sections
function switchSection(sectionName) {
    // Update menu items
    document.querySelectorAll('.menu-item').forEach(item => {
        item.classList.remove('active');
    });
    document.querySelector(`[data-section="${sectionName}"]`).classList.add('active');

    // Update sections
    document.querySelectorAll('.content-section').forEach(section => {
        section.classList.remove('active');
    });
    document.getElementById(`${sectionName}-section`).classList.add('active');

    // Load data based on section
    if (sectionName === 'playlists') {
        loadPlaylists();
    }
}

// Load featured music
async function loadFeaturedMusic() {
    const container = document.getElementById('featured-songs');
    container.innerHTML = '<div class="loading"><i class="fas fa-spinner fa-spin"></i> Loading...</div>';

    try {
        const response = await fetch('/api/music/featured');
        const data = await response.json();

        if (data.success) {
            allSongs = [...data.songs];
            displaySongs(data.songs, container);
        } else {
            container.innerHTML = '<div class="empty-state"><i class="fas fa-exclamation-circle"></i><p>Failed to load music</p></div>';
        }
    } catch (error) {
        console.error('Error loading featured music:', error);
        container.innerHTML = '<div class="empty-state"><i class="fas fa-exclamation-circle"></i><p>Error loading music</p></div>';
    }
}

// Display songs in a grid
function displaySongs(songs, container) {
    if (songs.length === 0) {
        container.innerHTML = '<div class="empty-state"><i class="fas fa-music"></i><p>No songs found</p></div>';
        return;
    }

    container.innerHTML = songs.map(song => `
        <div class="song-card">
            <img src="${song.image_url}" alt="${song.title}" class="song-image">
            <div class="song-title">${song.title}</div>
            <div class="song-artist">${song.artist}</div>
            <div class="song-actions">
                <button class="btn btn-primary" onclick='playSong(${JSON.stringify(song)})'>
                    <i class="fas fa-play"></i>
                </button>
                <button class="btn btn-secondary" onclick='openAddToPlaylistModal(${JSON.stringify(song)})'>
                    <i class="fas fa-plus"></i>
                </button>
            </div>
        </div>
    `).join('');
}

// Play a song
function playSong(song) {
    currentSong = song;
    const player = document.getElementById('music-player');
    const audio = document.getElementById('audio-player');
    const playBtn = document.getElementById('play-btn');

    // Update player UI
    document.getElementById('player-image').src = song.image_url;
    document.getElementById('player-title').textContent = song.title;
    document.getElementById('player-artist').textContent = song.artist;
    document.getElementById('duration').textContent = formatTime(song.duration);

    // Set audio source (using sample audio)
    audio.src = song.preview_url;
    
    // Show player
    player.style.display = 'grid';

    // Play audio
    audio.play();
    playBtn.innerHTML = '<i class="fas fa-pause"></i>';

    // Update progress bar
    audio.addEventListener('timeupdate', updateProgress);
    audio.addEventListener('ended', () => {
        playBtn.innerHTML = '<i class="fas fa-play"></i>';
    });
}

// Toggle play/pause
function togglePlay() {
    const audio = document.getElementById('audio-player');
    const playBtn = document.getElementById('play-btn');

    if (audio.paused) {
        audio.play();
        playBtn.innerHTML = '<i class="fas fa-pause"></i>';
    } else {
        audio.pause();
        playBtn.innerHTML = '<i class="fas fa-play"></i>';
    }
}

// Update progress bar
function updateProgress() {
    const audio = document.getElementById('audio-player');
    const progressBar = document.getElementById('progress-bar');
    const currentTime = document.getElementById('current-time');

    if (audio.duration) {
        const progress = (audio.currentTime / audio.duration) * 100;
        progressBar.value = progress;
        currentTime.textContent = formatTime(audio.currentTime);
    }
}

// Seek in song
document.getElementById('progress-bar').addEventListener('change', (e) => {
    const audio = document.getElementById('audio-player');
    const seekTime = (e.target.value / 100) * audio.duration;
    audio.currentTime = seekTime;
});

// Previous song
function previousSong() {
    const currentIndex = allSongs.findIndex(s => s.id === currentSong.id);
    if (currentIndex > 0) {
        playSong(allSongs[currentIndex - 1]);
    }
}

// Next song
function nextSong() {
    const currentIndex = allSongs.findIndex(s => s.id === currentSong.id);
    if (currentIndex < allSongs.length - 1) {
        playSong(allSongs[currentIndex + 1]);
    }
}

// Format time (seconds to mm:ss)
function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
}

// Load user playlists
async function loadPlaylists() {
    const container = document.getElementById('playlists-container');
    container.innerHTML = '<div class="loading"><i class="fas fa-spinner fa-spin"></i> Loading...</div>';

    try {
        const response = await fetch('/api/playlists');
        const data = await response.json();

        if (data.success) {
            playlists = data.playlists;
            displayPlaylists(playlists, container);
        } else {
            container.innerHTML = '<div class="empty-state"><i class="fas fa-list-music"></i><p>No playlists yet</p></div>';
        }
    } catch (error) {
        console.error('Error loading playlists:', error);
        container.innerHTML = '<div class="empty-state"><i class="fas fa-exclamation-circle"></i><p>Error loading playlists</p></div>';
    }
}

// Display playlists
function displayPlaylists(playlists, container) {
    if (playlists.length === 0) {
        container.innerHTML = '<div class="empty-state"><i class="fas fa-list-music"></i><p>No playlists yet. Create one to get started!</p></div>';
        return;
    }

    container.innerHTML = playlists.map(playlist => `
        <div class="playlist-card" onclick="viewPlaylist('${playlist._id}')">
            <div class="playlist-header">
                <div class="playlist-icon">
                    <i class="fas fa-list-music"></i>
                </div>
                <div class="playlist-actions" onclick="event.stopPropagation()">
                    <button class="icon-btn" onclick="deletePlaylist('${playlist._id}')" title="Delete">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
            <div class="playlist-name">${playlist.name}</div>
            <div class="playlist-description">${playlist.description || 'No description'}</div>
            <div class="playlist-count">
                <i class="fas fa-music"></i> ${playlist.songs.length} songs
            </div>
        </div>
    `).join('');
}

// View playlist details
function viewPlaylist(playlistId) {
    const playlist = playlists.find(p => p._id === playlistId);
    if (!playlist) return;

    // Switch to featured section and display playlist songs
    switchSection('featured');
    const container = document.getElementById('featured-songs');
    
    if (playlist.songs.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-music"></i>
                <p>This playlist is empty</p>
                <button class="btn btn-primary" onclick="switchSection('search')">
                    <i class="fas fa-search"></i> Find Music to Add
                </button>
            </div>
        `;
    } else {
        displaySongs(playlist.songs, container);
    }

    // Update section header
    document.querySelector('#featured-section .section-header h2').innerHTML = 
        `<i class="fas fa-list-music"></i> ${playlist.name}`;
}

// Create playlist modal
function showCreatePlaylistModal() {
    document.getElementById('create-playlist-modal').classList.add('show');
}

function closeCreatePlaylistModal() {
    document.getElementById('create-playlist-modal').classList.remove('show');
    document.getElementById('create-playlist-form').reset();
}

// Create playlist
async function createPlaylist(e) {
    e.preventDefault();

    const name = document.getElementById('playlist-name').value.trim();
    const description = document.getElementById('playlist-description').value.trim();
    const is_public = document.getElementById('playlist-public').checked;

    if (!name) {
        alert('Please enter a playlist name');
        return;
    }

    try {
        const response = await fetch('/api/playlists', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name, description, is_public })
        });

        const data = await response.json();

        if (data.success) {
            closeCreatePlaylistModal();
            await loadPlaylists();
            switchSection('playlists');
        } else {
            alert(data.message || 'Failed to create playlist');
        }
    } catch (error) {
        console.error('Error creating playlist:', error);
        alert('Error creating playlist');
    }
}

// Delete playlist
async function deletePlaylist(playlistId) {
    if (!confirm('Are you sure you want to delete this playlist?')) {
        return;
    }

    try {
        const response = await fetch(`/api/playlists/${playlistId}`, {
            method: 'DELETE'
        });

        const data = await response.json();

        if (data.success) {
            await loadPlaylists();
        } else {
            alert(data.message || 'Failed to delete playlist');
        }
    } catch (error) {
        console.error('Error deleting playlist:', error);
        alert('Error deleting playlist');
    }
}

// Open add to playlist modal
function openAddToPlaylistModal(song) {
    selectedSongForPlaylist = song;
    const modal = document.getElementById('add-to-playlist-modal');
    const selection = document.getElementById('playlist-selection');

    modal.classList.add('show');

    if (playlists.length === 0) {
        selection.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-list-music"></i>
                <p>No playlists yet. Create one first!</p>
                <button class="btn btn-primary" onclick="closeAddToPlaylistModal(); showCreatePlaylistModal()">
                    <i class="fas fa-plus"></i> Create Playlist
                </button>
            </div>
        `;
    } else {
        selection.innerHTML = playlists.map(playlist => `
            <div class="playlist-option" onclick="addSongToPlaylist('${playlist._id}')">
                <i class="fas fa-list-music"></i>
                <div>
                    <div class="playlist-name">${playlist.name}</div>
                    <div class="playlist-count">${playlist.songs.length} songs</div>
                </div>
            </div>
        `).join('');
    }
}

function closeAddToPlaylistModal() {
    document.getElementById('add-to-playlist-modal').classList.remove('show');
    selectedSongForPlaylist = null;
}

// Add song to playlist
async function addSongToPlaylist(playlistId) {
    if (!selectedSongForPlaylist) return;

    try {
        const response = await fetch(`/api/playlists/${playlistId}/songs`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                song_id: selectedSongForPlaylist.id,
                title: selectedSongForPlaylist.title,
                artist: selectedSongForPlaylist.artist,
                album: selectedSongForPlaylist.album,
                duration: selectedSongForPlaylist.duration,
                preview_url: selectedSongForPlaylist.preview_url,
                image_url: selectedSongForPlaylist.image_url
            })
        });

        const data = await response.json();

        if (data.success) {
            closeAddToPlaylistModal();
            await loadPlaylists();
            alert('Song added to playlist!');
        } else {
            alert(data.message || 'Failed to add song to playlist');
        }
    } catch (error) {
        console.error('Error adding song to playlist:', error);
        alert('Error adding song to playlist');
    }
}

// Search music
async function searchMusic() {
    const query = document.getElementById('search-input').value.trim();
    const container = document.getElementById('search-results');

    if (!query) {
        container.innerHTML = '<div class="empty-state"><i class="fas fa-search"></i><p>Enter a search term to find music</p></div>';
        return;
    }

    container.innerHTML = '<div class="loading"><i class="fas fa-spinner fa-spin"></i> Searching...</div>';

    try {
        const response = await fetch(`/api/music/search?q=${encodeURIComponent(query)}`);
        const data = await response.json();

        if (data.success) {
            displaySongs(data.results, container);
        } else {
            container.innerHTML = '<div class="empty-state"><i class="fas fa-exclamation-circle"></i><p>Search failed</p></div>';
        }
    } catch (error) {
        console.error('Search error:', error);
        container.innerHTML = '<div class="empty-state"><i class="fas fa-exclamation-circle"></i><p>Error searching</p></div>';
    }
}

// Close modals when clicking outside
window.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal')) {
        e.target.classList.remove('show');
    }
});
