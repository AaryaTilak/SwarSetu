import React, { useState, useEffect, useMemo } from 'react';
import Header from './components/Header';
import MusicCarousel from './components/MusicCarousel';
import Player from './components/Player';
// import BrowsePage from './components/BrowsePage';
import LibraryPage from './components/LibraryPage';
import UploadsPage from './components/UploadsPage';
import SettingsPage from './components/SettingsPage';
import EditProfilePage from './components/EditProfilePage';
import PlaylistPage from './components/PlaylistPage';
import AuthPage from './components/AuthPage';
import 'bootstrap-icons/font/bootstrap-icons.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

// --- HELPER COMPONENT: Category Column ---
// Updated to accept and display a 'coverImage'
const CategoryColumn = ({ title, items, onPlay, coverImage }) => (
  <div className="card h-100 bg-dark text-white border-secondary overflow-hidden">
    {/* NEW: Cover Image at the top of the card */}
    <div style={{ height: '400px', width: '100%', overflow: 'hidden' }}>
      <img 
        src={coverImage} 
        alt={title} 
        className="card-img-top" 
        style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.9 }} 
        onError={(e) => e.target.src = 'https://via.placeholder.com/300x150?text=Music'} 
      />
    </div>

    <div className="card-header border-secondary bg-transparent">
      <h5 className="card-title mb-0 fw-bold" style={{ color: '#D97925' }}>{title}</h5>
    </div>
    
    <div className="card-body p-2" style={{ height: '100px', overflowY: 'auto' }}>
      {items && items.length > 0 ? (
        <ul className="list-group list-group-flush">
          {items.map((item) => (
            <li 
              key={item.id} 
              className="list-group-item bg-transparent text-white border-secondary d-flex align-items-center p-2 mb-1" 
              style={{ cursor: 'pointer', borderRadius: '4px' }} 
              onClick={() => onPlay(item)} 
            >
              <img 
                src={item.image} 
                alt={item.title} 
                className="me-2 rounded" 
                style={{ width: '40px', height: '40px', objectFit: 'cover' }} 
                onError={(e) => e.target.src = 'https://via.placeholder.com/40?text=Music'} 
              />
              <div style={{ minWidth: 0 }}>
                <div className="fw-bold text-truncate" style={{ fontSize: '0.9rem' }}>{item.title}</div>
                <small className="text-muted d-block text-truncate" style={{ fontSize: '0.75rem' }}>{item.artist}</small>
              </div>
              <button className="btn btn-link text-white ms-auto"><i className="bi bi-play-circle fs-4"></i></button>
            </li>
          ))}
        </ul>
      ) : (
        <div className="text-center text-muted py-5">
          <i className="bi bi-music-note-beamed fs-1 mb-2 d-block"></i>
          <small>No songs available</small>
        </div>
      )}
    </div>
  </div>
);

function App() {
  // --- Authentication State ---
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  // --- Main App State ---
  const [currentPage, setCurrentPage] = useState('home');
  const [nowPlaying, setNowPlaying] = useState(null);
  const [currentPlaylist, setCurrentPlaylist] = useState(null);
  const [uploadedSongs, setUploadedSongs] = useState([]);
  const [isShuffled, setIsShuffled] = useState(false);
  const [playQueue, setPlayQueue] = useState([]);
  const [likedSongIds, setLikedSongIds] = useState([]);

  const backendUrl = 'http://localhost:4000';

  // --- IMAGE MAPPING (Local Assets) ---
  const categoryImages = {
    'Classical': '/assets/MorningRaagas.jpg',
    'Semi-Classical': '/assets/SemiClassical.jpg',
    'Thumri': '/assets/Thumri.jpg',
    'New Releases': '/assets/Ghazal.jpg', 
    'Artists': '/assets/Thumri.jpg', // Added image for Artists card
    'Default': '/assets/Ghazal.jpg'
  };

  // --- DATA PROCESSING & CATEGORIZATION ---

  const formatSongAsCard = (song) => {
    let imageUrl;
    if (song.image_filename) {
      imageUrl = `${backendUrl}/uploads/${song.image_filename}`;
    } else if (song.category && categoryImages[song.category]) {
      imageUrl = categoryImages[song.category];
    } else {
      imageUrl = categoryImages['Default'];
    }

    return {
      id: `song-${song.id}`,
      title: song.title,
      artist: song.artist,
      image: imageUrl,
      songs: [song] 
    };
  };

  // 1. New Releases
  const newReleases = useMemo(() => {
    return uploadedSongs.slice().reverse().map(formatSongAsCard);
  }, [uploadedSongs]);

  // 2. Classical Music
  const classicalSongs = useMemo(() => {
    return uploadedSongs
      .filter(song => song.category === 'Classical')
      .map(formatSongAsCard);
  }, [uploadedSongs]);

  // 3. Semi-Classical Music
  const semiClassicalSongs = useMemo(() => {
    return uploadedSongs
      .filter(song => song.category === 'Semi-Classical')
      .map(formatSongAsCard);
  }, [uploadedSongs]);

  // 4. Artist Grouping
  const artistGroups = useMemo(() => {
    const groups = {};
    uploadedSongs.forEach(song => {
      const name = song.artist || 'Unknown';
      if (!groups[name]) {
        let artistImage;
        if (song.image_filename) {
            artistImage = `${backendUrl}/uploads/${song.image_filename}`;
        } else {
            artistImage = categoryImages[song.category] || categoryImages['Default'];
        }

        groups[name] = {
          id: `artist-${name}`,
          title: name,
          artist: 'Artist',
          image: artistImage,
          songs: []
        };
      }
      groups[name].songs.push(song);
    });
    return Object.values(groups);
  }, [uploadedSongs]);

  const likedSongsList = useMemo(() => {
    return uploadedSongs.filter(song => likedSongIds.includes(song.id));
  }, [uploadedSongs, likedSongIds]);


  // --- Authentication Handlers ---
  const handleLogin = async (email, password) => {
    try {
      const response = await fetch(`${backendUrl}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      if (!response.ok) { alert(data.error); return; }
      setCurrentUser(data.user);
      setIsAuthenticated(true);
      setCurrentPage('home');
    } catch (error) {
      console.error("Login failed:", error);
      alert("Network error. Please ensure backend is running.");
    }
  };

  const handleSignup = async (name, email, password) => {
    try {
      const response = await fetch(`${backendUrl}/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });
      if (!response.ok) { const data = await response.json(); alert(data.error); return; }
      alert("Account created successfully! Please log in.");
    } catch (error) {
      console.error("Signup failed:", error);
      alert("Network error. Please ensure backend is running.");
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false); setCurrentUser(null); setLikedSongIds([]); setNowPlaying(null); setCurrentPage('home');
  };

  // --- API Fetching ---
  const fetchUploadedSongs = async () => {
    try {
      const response = await fetch(`${backendUrl}/songs`);
      const data = await response.json();
      setUploadedSongs(data);
    } catch (error) { console.error("Failed to fetch songs:", error); }
  };

  const fetchUserLikes = async (userId) => {
    try {
      const response = await fetch(`${backendUrl}/likes/${userId}`);
      if (response.ok) { const ids = await response.json(); setLikedSongIds(ids); }
    } catch (error) { console.error("Failed to fetch likes:", error); }
  };

  useEffect(() => {
    if (isAuthenticated && currentUser) { fetchUploadedSongs(); fetchUserLikes(currentUser.id); }
  }, [isAuthenticated, currentUser]);


  // --- User Actions ---
  const handleToggleLike = async (song) => {
    if (!currentUser) return;
    const isLiked = likedSongIds.includes(song.id);
    if (isLiked) setLikedSongIds(prev => prev.filter(id => id !== song.id));
    else setLikedSongIds(prev => [...prev, song.id]);

    try {
        await fetch(`${backendUrl}/likes/toggle`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: currentUser.id, songId: song.id })
        });
    } catch (error) { console.error("Error toggling like:", error); }
  };

  const addSong = async (formData) => {
    try {
      const response = await fetch(`${backendUrl}/upload`, { method: 'POST', body: formData });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Upload failed');
      fetchUploadedSongs();
      return data.message;
    } catch (error) { console.error("Error uploading song:", error); throw error; }
  };

  const deleteSong = async (songId) => {
    if (!window.confirm("Delete this song?")) return;
    try {
      const response = await fetch(`${backendUrl}/songs/${songId}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Delete failed');
      fetchUploadedSongs();
    } catch (error) { console.error("Error deleting song:", error); }
  };

  // --- Playlist & Playback Logic ---
  const shuffleArray = (array) => {
    let shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  useEffect(() => {
    if (currentPlaylist) {
      const originalSongs = currentPlaylist.songs;
      setPlayQueue(isShuffled ? shuffleArray(originalSongs) : originalSongs);
    }
  }, [currentPlaylist, isShuffled]);

  const toggleShuffle = () => setIsShuffled(prev => !prev);
  const handlePlaylistClick = (playlist) => { setCurrentPlaylist(playlist); setCurrentPage('playlist'); };

  const handlePlaySong = (song) => {
    let imageUrl;
    if (song.image_filename) imageUrl = `${backendUrl}/uploads/${song.image_filename}`;
    else if (song.category && categoryImages[song.category]) imageUrl = categoryImages[song.category];
    else imageUrl = categoryImages['Default'];
    setNowPlaying({ ...song, image: imageUrl });
  };

  const handleNextSong = () => {
    if (!playQueue.length || !nowPlaying) return;
    const currentIndex = playQueue.findIndex(song => song.id === nowPlaying.id);
    const nextIndex = (currentIndex + 1) % playQueue.length;
    const nextSong = playQueue[nextIndex];
    handlePlaySong(nextSong); 
  };

  const handlePrevSong = () => {
    if (!playQueue.length || !nowPlaying) return;
    const currentIndex = playQueue.findIndex(song => song.id === nowPlaying.id);
    const prevIndex = (currentIndex - 1 + playQueue.length) % playQueue.length;
    const prevSong = playQueue[prevIndex];
    handlePlaySong(prevSong);
  };

  const handleBackToHome = () => setCurrentPage('home');

  // --- RENDER ---

  if (!isAuthenticated) {
    return <AuthPage onLogin={handleLogin} onSignup={handleSignup} />;
  }

  return (
    <>
      <Header onNavigate={setCurrentPage} activePage={currentPage} onLogout={handleLogout} />

      <main className="container mt-4" style={{ paddingBottom: '120px' }}>
        {currentPage === 'home' && (
          <>
            <div className="row g-4">
              {/* 1. Artists Column */}
              <div className="col-12 col-md-6 col-lg-3">
                <CategoryColumn 
                  title="Artists" 
                  items={artistGroups} 
                  onPlay={handlePlaylistClick}
                  coverImage={categoryImages['Artists']} 
                />
              </div>

              {/* 2. New Releases Column */}
              <div className="col-12 col-md-6 col-lg-3">
                <CategoryColumn 
                  title="New Releases" 
                  items={newReleases} 
                  onPlay={handlePlaylistClick}
                  coverImage={categoryImages['New Releases']} 
                />
              </div>

              {/* 3. Classical Column */}
              <div className="col-12 col-md-6 col-lg-3">
                <CategoryColumn 
                  title="Classical" 
                  items={classicalSongs} 
                  onPlay={handlePlaylistClick}
                  coverImage={categoryImages['Classical']} 
                />
              </div>

              {/* 4. Semi-Classical Column */}
              <div className="col-12 col-md-6 col-lg-3">
                <CategoryColumn 
                  title="Semi-Classical" 
                  items={semiClassicalSongs} 
                  onPlay={handlePlaylistClick}
                  coverImage={categoryImages['Semi-Classical']} 
                />
              </div>
            </div>

            {/* Empty State */}
            {uploadedSongs.length === 0 && (
                <div className="text-center text-white mt-5 p-5 border border-secondary rounded bg-dark">
                    <h4>Your Library is Empty</h4>
                    <p className="text-muted">Go to "Uploads" to add your first song!</p>
                </div>
            )}
          </>
        )}

        {currentPage === 'browse' && <BrowsePage />}
        {currentPage === 'library' && <LibraryPage likedSongs={likedSongsList} onPlaySong={handlePlaySong} />}
        {currentPage === 'uploads' && <UploadsPage uploadedSongs={uploadedSongs} onUpload={addSong} onDelete={deleteSong} />}
        {currentPage === 'editProfile' && <EditProfilePage uploadedSongs={uploadedSongs} onDelete={deleteSong} onNavigate={setCurrentPage} />}
        {currentPage === 'settings' && <SettingsPage onNavigate={setCurrentPage} />}
        {currentPage === 'playlist' && <PlaylistPage playlist={currentPlaylist} onPlaySong={handlePlaySong} onBack={handleBackToHome} likedSongIds={likedSongIds} onToggleLike={handleToggleLike} />}
      </main>

      <Player
        nowPlaying={nowPlaying}
        onNextSong={handleNextSong}
        onPrevSong={handlePrevSong}
        isShuffled={isShuffled}
        onToggleShuffle={toggleShuffle}
        playQueue={playQueue}
        likedSongIds={likedSongIds}
        onToggleLike={handleToggleLike}
      />
    </>
  );
}

export default App;