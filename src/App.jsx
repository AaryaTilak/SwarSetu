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
import 'bootstrap-icons/font/bootstrap-icons.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

// --- Placeholder Data ---
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

const initialUploads = [
    { id: 1663491221, name: 'My Custom Track.mp3' },
    { id: 1663491222, name: 'Chill Lofi Beat.wav' },
];

function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [nowPlaying, setNowPlaying] = useState(null);
  const [currentPlaylist, setCurrentPlaylist] = useState(null);
  const [uploadedSongs, setUploadedSongs] = useState(initialUploads);
  const [isShuffled, setIsShuffled] = useState(false);
  const [playQueue, setPlayQueue] = useState([]);

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

  const addSong = (newSongFile) => {
    const newSong = { id: Date.now(), name: newSongFile.name };
    setUploadedSongs(prevSongs => [newSong, ...prevSongs]);
  };
  const deleteSong = (songId) => {
    setUploadedSongs(prevSongs => prevSongs.filter(song => song.id !== songId));
  };

  const handlePlaylistClick = (playlist) => {
    setCurrentPlaylist(playlist);
    setCurrentPage('playlist');
  };

  const handlePlaySong = (song) => {
    setNowPlaying({ ...song, image: currentPlaylist.image });
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
        {currentPage === 'uploads' && <UploadsPage uploadedSongs={uploadedSongs} onUpload={addSong} onDelete={deleteSong} />}
        {currentPage === 'editProfile' && <EditProfilePage uploadedSongs={uploadedSongs} onDelete={deleteSong} onNavigate={setCurrentPage} />}
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