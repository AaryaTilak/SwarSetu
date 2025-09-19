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
    id: 1, title: 'Starfall', artist: 'Luna Beat', image: 'https://picsum.photos/seed/1/200',
    songs: [
      { id: 101, title: 'Galaxy Rise', artist: 'Luna Beat' },
      { id: 102, title: 'Nebula Dream', artist: 'Luna Beat' },
      { id: 103, title: 'Comet Tail', artist: 'Luna Beat' },
    ]
  },
  {
    id: 2, title: 'Ocean Drive', artist: 'Synth Wave', image: 'https://picsum.photos/seed/2/200',
    songs: [
      { id: 201, title: 'Sunset Cruise', artist: 'Synth Wave' },
      { id: 202, title: 'Night Ride', artist: 'Synth Wave' },
      { id: 203, title: 'City Lights', artist: 'Synth Wave' },
    ]
  },
  { id: 3, title: 'City Lights', artist: 'Metro Vibes', image: 'https://picsum.photos/seed/3/200',
    songs: [
      { id: 301, title: 'Downtown', artist: 'Metro Vibes' },
      { id: 302, title: 'Uptown Groove', artist: 'Metro Vibes' },
      { id: 303, title: 'Subway Beats', artist: 'Metro Vibes' },
    ]
   },
  { id: 4, title: 'Desert Mirage', artist: 'Echoes', image: 'https://picsum.photos/seed/4/200',
    songs: [
      { id: 401, title: 'Sandy Winds', artist: 'Echoes' },
      { id: 402, title: 'Oasis', artist: 'Echoes' },
      { id: 403, title: 'Dune Dance', artist: 'Echoes' },
    ]
   },
];

const popularArtists = [
 { id: 7, title: 'Aura', artist: 'Electronic', image: 'https://picsum.photos/seed/7/200', songs: [{id: 701, title: 'Pulse', artist: 'Aura'}] },
 { id: 8, title: 'Rift', artist: 'Rock', image: 'https://picsum.photos/seed/8/200', songs: [{id: 801, title: 'Fissure', artist: 'Rift'}] },
 { id: 9, title: 'Helios', artist: 'Ambient', image: 'https://picsum.photos/seed/9/200', songs: [{id: 901, title: 'Sunbeam', artist: 'Helios'}] },
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