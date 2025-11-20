import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import MusicCarousel from './components/MusicCarousel';
import Player from './components/Player';
import BrowsePage from './components/BrowsePage';
import LibraryPage from './components/LibraryPage';
import UploadsPage from './components/UploadsPage';
import SettingsPage from './components/SettingsPage';
import EditProfilePage from './components/EditProfilePage';
import PlaylistPage from './components/PlaylistPage';
import AuthPage from './components/AuthPage';
import 'bootstrap-icons/font/bootstrap-icons.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

// --- Static Data with Local Assets ---
const newReleases = [
  {
    id: 1, title: 'Ghazal', artist: 'Jagjit Singh', image: '/assets/Ghazal.jpg',
    songs: [
      { id: 101, title: 'Jhuki Jhuki si nazar', artist: 'Jagjit Singh' },
      { id: 102, title: 'Wo kagaz ki kashti', artist: 'Jagjit Singh' },
      { id: 103, title: 'Hazaron Khwahishen Aisi', artist: 'Jagjit Singh' },
    ]
  },
  {
    id: 2, title: 'Morning Raagas', artist: 'Dr. Prabha Atre', image: '/assets/MorningRaagas.jpg',
    songs: [
      { id: 201, title: 'Bhairav', artist: 'Dr. Prabha Atre' },
      { id: 202, title: 'Lalit', artist: 'Dr. Prabha Atre' },
      { id: 203, title: 'Todi', artist: 'Dr. Prabha Atre' },
    ]
  },
  {
    id: 3, title: 'Semi-classical music', artist: 'Shreya Ghoshal', image: '/assets/SemiClassical.jpg',
    songs: [
      { id: 301, title: 'Mere dholna', artist: 'Shreya Ghoshal' },
      { id: 302, title: 'Tere bin', artist: 'Shreya Ghoshal' },
      { id: 303, title: 'Bairi Piya', artist: 'Shreya Ghoshal' },
    ]
  },
  {
    id: 4, title: 'Thumri', artist: 'Ustad Rashid Khan', image: '/assets/Thumri.jpg',
    songs: [
      { id: 401, title: '"Aaj Radha Brij Ko Chali"', artist: 'Ustad Rashid Khan' },
      { id: 402, title: 'Babul Mora', artist: 'Ustad Rashid Khan' },
      { id: 403, title: 'Shyam Sundar Banwari', artist: 'Ustad Rashid Khan' },
    ]
  },
];

const popularArtists = [
  { id: 7, title: 'Morning Raagas', artist: 'Pta. Kishori Amonkar', image: 'https://picsum.photos/seed/7/200', songs: [{ id: 701, title: 'Raag Bhoop', artist: 'Pta. Kishori Amonkar' }] },
  { id: 8, title: 'Afternoon Raagas', artist: 'Malini Rajurkar', image: 'https://picsum.photos/seed/8/200', songs: [{ id: 801, title: 'Raag Sarang', artist: 'Malini Rajurkar' }] },
  { id: 9, title: 'Evening Raagas', artist: 'Parveen Sultana', image: 'https://picsum.photos/seed/9/200', songs: [{ id: 901, title: 'Raag Yaman', artist: 'Parveen Sultana' }] },
];

function App() {
  // --- Authentication State ---
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // --- Main App State ---
  const [currentPage, setCurrentPage] = useState('home');
  const [nowPlaying, setNowPlaying] = useState(null);
  const [currentPlaylist, setCurrentPlaylist] = useState(null);
  const [uploadedSongs, setUploadedSongs] = useState([]);
  const [isShuffled, setIsShuffled] = useState(false);
  const [playQueue, setPlayQueue] = useState([]);

  const backendUrl = 'http://localhost:4000';

  // --- Authentication Functions (Connected to Database) ---

  const handleLogin = async (email, password) => {
    try {
      const response = await fetch(`${backendUrl}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.error); // Display error from backend
        return;
      }

      // Login Successful
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

      const data = await response.json();

      if (!response.ok) {
        alert(data.error);
        return;
      }

      // Signup Successful - Automatically log user in
      alert("Account created successfully!");
      setIsAuthenticated(true);
      setCurrentPage('home');
    } catch (error) {
      console.error("Signup failed:", error);
      alert("Network error. Please ensure backend is running.");
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setNowPlaying(null);
    setCurrentPage('home');
  };

  // --- API Functions ---
  const fetchUploadedSongs = async () => {
    try {
      const response = await fetch(`${backendUrl}/songs`);
      const data = await response.json();
      setUploadedSongs(data);
    } catch (error) {
      console.error("Failed to fetch songs:", error);
    }
  };

  // Fetch songs only when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetchUploadedSongs();
    }
  }, [isAuthenticated]);


  // --- File Upload & Delete Functions ---
  const addSong = async (formData) => {
    try {
      const response = await fetch(`${backendUrl}/upload`, {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Upload failed');
      }
      fetchUploadedSongs();
      return data.message;
    } catch (error) {
      console.error("Error uploading song:", error);
      throw error;
    }
  };

  const deleteSong = async (songId) => {
    if (!window.confirm("Are you sure you want to delete this song?")) {
      return;
    }
    try {
      const response = await fetch(`${backendUrl}/songs/${songId}`, {
        method: 'DELETE',
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Delete failed');
      }
      fetchUploadedSongs();
    } catch (error) {
      console.error("Error deleting song:", error);
    }
  };

  // --- Playlist Logic ---
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

  const toggleShuffle = () => {
    setIsShuffled(prev => !prev);
  };

  const handlePlaylistClick = (playlist) => {
    setCurrentPlaylist(playlist);
    setCurrentPage('playlist');
  };

  // --- Playback Logic ---
  const handlePlaySong = (song) => {
    let imageUrl;

    // 1. Uploaded song (from backend)
    if (song.image_filename) {
      imageUrl = `${backendUrl}/uploads/${song.image_filename}`;
    }
    // 2. Static playlist song
    else if (currentPlaylist && currentPlaylist.image) {
      imageUrl = currentPlaylist.image;
    }
    // 3. Fallback
    else {
      imageUrl = 'https://picsum.photos/seed/default/200';
    }

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

  const handleBackToHome = () => {
    setCurrentPage('home');
  };

  // --- Conditional Rendering ---

  // 1. If NOT authenticated, show Login/Signup Page
  if (!isAuthenticated) {
    // Pass both handlers to AuthPage
    return <AuthPage onLogin={handleLogin} onSignup={handleSignup} />;
  }

  // 2. If authenticated, show the Main App
  return (
    <>
      <Header onNavigate={setCurrentPage} activePage={currentPage} onLogout={handleLogout} />

      <main className="container mt-4">
        {currentPage === 'home' && (
          <>
            <MusicCarousel title="New Releases" data={newReleases} onPlaylistClick={handlePlaylistClick} />
            <MusicCarousel title="Popular Artists" data={popularArtists} onPlaylistClick={handlePlaylistClick} />
            <MusicCarousel title="Top Playlists" data={newReleases.slice().reverse()} onPlaylistClick={handlePlaylistClick} />
          </>
        )}

        {currentPage === 'browse' && <BrowsePage />}
        {currentPage === 'library' && <LibraryPage />}

        {currentPage === 'uploads' && (
          <UploadsPage
            uploadedSongs={uploadedSongs}
            onUpload={addSong}
            onDelete={deleteSong}
          />
        )}

        {currentPage === 'editProfile' && (
          <EditProfilePage
            uploadedSongs={uploadedSongs}
            onDelete={deleteSong}
            onNavigate={setCurrentPage}
          />
        )}

        {currentPage === 'settings' && <SettingsPage onNavigate={setCurrentPage} />}

        {currentPage === 'playlist' && (
          <PlaylistPage
            playlist={currentPlaylist}
            onPlaySong={handlePlaySong}
            onBack={handleBackToHome}
          />
        )}
      </main>

      <Player
        nowPlaying={nowPlaying}
        onNextSong={handleNextSong}
        onPrevSong={handlePrevSong}
        isShuffled={isShuffled}
        onToggleShuffle={toggleShuffle}
        playQueue={playQueue}
      />
    </>
  );
}

export default App;