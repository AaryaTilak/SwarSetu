import React, { useState, useEffect } from 'react'; // Make sure useEffect is imported
import Header from './components/Header';
import MusicCarousel from './components/MusicCarousel';
import Player from './components/Player';
import BrowsePage from './components/BrowsePage';
import LibraryPage from './components/LibraryPage';
import UploadsPage from './components/UploadsPage';
import SettingsPage from './components/SettingsPage';
import EditProfilePage from './components/EditProfilePage';
import PlaylistPage from './components/PlaylistPage';
import 'bootstrap-icons/font/bootstrap-icons.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

// --- Mock Data for Playlists (Can be replaced by API later) ---
const newReleases = [
  {
    id: 1, title: 'Ghazal', artist: 'Jagjit Singh', image: 'https://picsum.photos/seed/1/200',
    songs: [
      { id: 101, title: 'Jhuki Jhuki si nazar', artist: 'Jagjit Singh' },
      { id: 102, title: 'Wo kagaz ki kashti', artist: 'Jagjit Singh' },
      { id: 103, title: 'Hazaron Khwahishen Aisi', artist: 'Jagjit Singh' },
    ]
  },
  {
    id: 2, title: 'Morning Raagas', artist: 'Dr. Prabha Atre', image: 'https://picsum.photos/seed/2/200',
    songs: [
      { id: 201, title: 'Bhairav', artist: 'Dr. Prabha Atre' },
      { id: 202, title: 'Lalit', artist: 'Dr. Prabha Atre' },
      { id: 203, title: 'Todi', artist: 'Dr. Prabha Atre' },
    ]
  },
  { id: 3, title: 'Semi-classical music', artist: 'Shreya Ghoshal', image: 'https://picsum.photos/seed/3/200',
    songs: [
      { id: 301, title: 'Mere dholna', artist: 'Shreya Ghoshal' },
      { id: 302, title: 'Tere bin', artist: 'Shreya Ghoshal' },
      { id: 303, title: 'Bairi Piya', artist: 'Shreya Ghoshal' },
    ]
   },
  { id: 4, title: 'Thumri', artist: 'Ustad Rashid Khan', image: 'https://picsum.photos/seed/4/200',
    songs: [
      { id: 401, title: '"Aaj Radha Brij Ko Chali"', artist: 'Ustad Rashid Khan' },
      { id: 402, title: 'Babul Mora', artist: 'Ustad Rashid Khan' },
      { id: 403, title: 'Shyam Sundar Banwari', artist: 'Ustad Rashid Khan' },
    ]
   },
];

const popularArtists = [
 { id: 7, title: 'Morning Raagas', artist: 'Pta. Kishori Amonkar', image: 'https://picsum.photos/seed/7/200', songs: [{id: 701, title: 'Raag Bhoop', artist: 'Pta. Kishori Amonkar'}] },
 { id: 8, title: 'Afternoon Raagas', artist: 'Malini Rajurkar', image: 'https://picsum.photos/seed/8/200', songs: [{id: 801, title: 'Raag Sarang', artist: 'Malini Rajurkar'}] },
 { id: 9, title: 'Evening Raagas', artist: 'Parveen Sultana', image: 'https://picsum.photos/seed/9/200', songs: [{id: 901, title: 'Raag Yaman', artist: 'Parveen Sultana'}] },
];

// --- We no longer need 'initialUploads' as it will come from the API ---

function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [nowPlaying, setNowPlaying] = useState(null);
  const [currentPlaylist, setCurrentPlaylist] = useState(null);
  
  // This state will now be filled by your API
  const [uploadedSongs, setUploadedSongs] = useState([]);
  
  const [isShuffled, setIsShuffled] = useState(false);
  const [playQueue, setPlayQueue] = useState([]);

  // Define the base URL of your backend server
  const backendUrl = 'http://localhost:4000';

  // --- NEW: Function to fetch songs from the database ---
  const fetchUploadedSongs = async () => {
    try {
      const response = await fetch(`${backendUrl}/songs`);
      const data = await response.json();
      setUploadedSongs(data);
    } catch (error) {
      console.error("Failed to fetch songs:", error);
    }
  };

  // --- NEW: Fetch songs when the app first loads ---
  useEffect(() => {
    fetchUploadedSongs();
  }, []); // The empty array [] means this runs only once on mount

  // --- Shuffle logic remains the same ---
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

  // --- UPDATED: 'addSong' function now calls the API ---
  const addSong = async (formData) => {
    try {
      const response = await fetch(`${backendUrl}/upload`, {
        method: 'POST',
        body: formData, // FormData already contains title, artist, and audio file
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Upload failed');
      }

      // After successful upload, refresh the song list from the database
      fetchUploadedSongs();
      return data.message; // Return success message to UploadsPage
    } catch (error) {
      console.error("Error uploading song:", error);
      throw error; // Throw error back to UploadsPage to display
    }
  };

  // --- UPDATED: 'deleteSong' function now calls the API ---
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

      // After successful delete, refresh the song list
      fetchUploadedSongs();
    } catch (error) {
      console.error("Error deleting song:", error);
    }
  };

  // --- Playlist and Playback logic remains the same ---
  const handlePlaylistClick = (playlist) => {
    setCurrentPlaylist(playlist);
    setCurrentPage('playlist');
  };

  const handlePlaySong = (song) => {
    // Check if the song is from a playlist (has .image) or an upload (no .image)
    const image = currentPlaylist?.image || 'https://picsum.photos/seed/default/200'; // Fallback image for uploads
    setNowPlaying({ ...song, image: image });
  };

  const handleNextSong = () => {
    if (!playQueue.length || !nowPlaying) return;
    const currentIndex = playQueue.findIndex(song => song.id === nowPlaying.id);
    const nextIndex = (currentIndex + 1) % playQueue.length;
    const nextSong = playQueue[nextIndex];
    setNowPlaying({ ...nextSong, image: currentPlaylist.image });
  };

  const handlePrevSong = () => {
    if (!playQueue.length || !nowPlaying) return;
    const currentIndex = playQueue.findIndex(song => song.id === nowPlaying.id);
    const prevIndex = (currentIndex - 1 + playQueue.length) % playQueue.length;
    const prevSong = playQueue[prevIndex];
    setNowPlaying({ ...prevSong, image: currentPlaylist.image });
  };

  const handleBackToHome = () => {
    setCurrentPage('home');
  };

  return (
    <>
      <Header onNavigate={setCurrentPage} activePage={currentPage} />
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
        
        {/* These components now use the API-driven functions */}
        {currentPage === 'uploads' && 
          <UploadsPage 
            uploadedSongs={uploadedSongs} 
            onUpload={addSong} 
            onDelete={deleteSong} 
          />}
        {currentPage === 'editProfile' && 
          <EditProfilePage 
            uploadedSongs={uploadedSongs} 
            onDelete={deleteSong} 
            onNavigate={setCurrentPage} 
          />}
        
        {currentPage === 'settings' && <SettingsPage onNavigate={setCurrentPage} />}
        {currentPage === 'playlist' && <PlaylistPage playlist={currentPlaylist} onPlaySong={handlePlaySong} onBack={handleBackToHome} />}
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