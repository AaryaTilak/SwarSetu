import React, { useState, useRef, useEffect } from 'react';

// Updated props to accept 'likedSongIds' and 'onToggleLike'
const Player = ({ nowPlaying, onNextSong, onPrevSong, isShuffled, onToggleShuffle, playQueue, likedSongIds, onToggleLike }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [showQueue, setShowQueue] = useState(false);

  const audioRef = useRef(null);

  // Check if the currently playing song is in the liked list
  const isLiked = nowPlaying && likedSongIds ? likedSongIds.includes(nowPlaying.id) : false;

  useEffect(() => {
    if (nowPlaying && audioRef.current) {
      // 1. Determine the Audio Source URL
      let audioSrc;
      if (nowPlaying.filename) {
        // It's an uploaded song -> Use Backend URL
        audioSrc = `http://localhost:4000/uploads/${nowPlaying.filename}`;
      } else {
        // It's a static/demo song -> Use Placeholder
        audioSrc = 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3';
      }

      audioRef.current.src = audioSrc;
      
      // 2. Play
      audioRef.current.play()
        .catch(error => console.error("Audio Playback Error:", error));
      setIsPlaying(true);
    }
  }, [nowPlaying]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  const handlePlayPause = () => {
    if (!nowPlaying) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(error => console.error("Audio Playback Error:", error));
    }
    setIsPlaying(!isPlaying);
  };

  const handleTimeUpdate = () => {
    setCurrentTime(audioRef.current.currentTime);
  };

  const handleLoadedMetadata = () => {
    setDuration(audioRef.current.duration);
  };

  const handleSeek = (e) => {
    audioRef.current.currentTime = e.target.value;
    setCurrentTime(e.target.value);
  };

  const handleVolumeChange = (e) => {
    setVolume(e.target.value);
  };

  const formatTime = (timeInSeconds) => {
    if (isNaN(timeInSeconds)) return '0:00';
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  return (
    <>
      <footer className="fixed-bottom bg-dark text-white p-3 border-top border-secondary">
        <audio
          ref={audioRef}
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onEnded={onNextSong}
        />
        <div className="container-fluid">
          <div className="row align-items-center">
            {/* Song Info Section */}
            <div className="col-md-3 d-flex align-items-center">
              {nowPlaying ? (
                <>
                  <img src={nowPlaying.image} alt="Album Art" className="me-3 rounded" style={{ width: '56px', height: '56px', objectFit: 'cover' }} />
                  <div className="me-3" style={{ minWidth: 0 }}>
                    <h6 className="mb-0 text-truncate">{nowPlaying.title}</h6>
                    <small className="text-muted">{nowPlaying.artist}</small>
                  </div>
                  {/* NEW: Heart Icon Button */}
                  <button 
                    className="btn btn-link p-0" 
                    onClick={() => onToggleLike(nowPlaying)}
                    style={{ color: isLiked ? '#D97925' : '#6c757d' }} // Orange if liked, Gray if not
                  >
                    <i className={`bi ${isLiked ? 'bi-heart-fill' : 'bi-heart'} fs-5`}></i>
                  </button>
                </>
              ) : (
                <div>
                  <h6 className="mb-0">No song playing</h6>
                  <small className="text-muted">Select a song to play</small>
                </div>
              )}
            </div>

            {/* Controls Section */}
            <div className="col-md-6">
              <div className="d-flex align-items-center justify-content-center mb-2">
                <button className={`btn btn-link ${isShuffled ? 'text-primary' : 'text-white'}`} onClick={onToggleShuffle} disabled={!nowPlaying}>
                  <i className="bi bi-shuffle fs-5"></i>
                </button>
                <button className="btn btn-link text-white" onClick={onPrevSong} disabled={!nowPlaying}><i className="bi bi-skip-start-fill fs-4"></i></button>
                <button className="btn btn-link text-white" onClick={handlePlayPause} disabled={!nowPlaying}>
                  <i className={`bi ${isPlaying ? 'bi-pause-circle-fill' : 'bi-play-circle-fill'} fs-2`}></i>
                </button>
                <button className="btn btn-link text-white" onClick={onNextSong} disabled={!nowPlaying}><i className="bi bi-skip-end-fill fs-4"></i></button>
                <button className="btn btn-link text-white" disabled={!nowPlaying}><i className="bi bi-repeat fs-5"></i></button>
              </div>
              <div className="d-flex align-items-center">
                <small>{formatTime(currentTime)}</small>
                <input
                  type="range"
                  className="form-range mx-2"
                  min="0"
                  max={duration || 0}
                  value={currentTime}
                  onChange={handleSeek}
                  disabled={!nowPlaying}
                />
                <small>{formatTime(duration)}</small>
              </div>
            </div>

            {/* Volume & Queue Section */}
            <div className="col-md-3 d-flex align-items-center justify-content-end">
              <button className="btn btn-link text-white me-2" onClick={() => setShowQueue(true)} disabled={!nowPlaying}>
                <i className="bi bi-music-note-list fs-4"></i>
              </button>
              <i className={`bi ${volume > 0.5 ? 'bi-volume-up' : volume > 0 ? 'bi-volume-down' : 'bi-volume-mute'} fs-5`}></i>
              <input
                type="range"
                className="form-range ms-2"
                style={{ maxWidth: '100px' }}
                min="0"
                max="1"
                step="0.01"
                value={volume}
                onChange={handleVolumeChange}
              />
            </div>
          </div>
        </div>
      </footer>

      {/* Queue Modal */}
      {showQueue && (
        <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.7)' }}>
          <div className="modal-dialog modal-dialog-centered modal-dialog-scrollable">
            <div className="modal-content bg-dark text-white">
              <div className="modal-header border-secondary">
                <h5 className="modal-title">Up Next</h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setShowQueue(false)}></button>
              </div>
              <div className="modal-body">
                <ul className="list-group list-group-flush">
                  {playQueue.map((song, index) => (
                    <li
                      key={index}
                      className={`list-group-item bg-dark text-white border-secondary ${nowPlaying?.id === song.id ? 'active' : ''}`}
                    >
                      <div className="fw-bold">{song.title}</div>
                      <small className="text-muted">{song.artist}</small>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Player;