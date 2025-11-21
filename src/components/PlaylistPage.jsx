import React from 'react';

// Updated to accept 'likedSongIds' and 'onToggleLike' props
const PlaylistPage = ({ playlist, onPlaySong, onBack, likedSongIds, onToggleLike }) => {
  if (!playlist) {
    return (
      <div className="text-center text-white">
        <p>Playlist not found.</p>
        <button onClick={onBack} className="btn btn-primary">Go to Home</button>
      </div>
    );
  }

  return (
    <div className="container text-white">
      <button onClick={onBack} className="btn btn-outline-light mb-4">
        <i className="bi bi-arrow-left me-2"></i>Back
      </button>
      <div className="row">
        <div className="col-md-4 text-center text-md-start">
          <img src={playlist.image} alt={playlist.title} className="img-fluid rounded-3 mb-3" />
          <h2>{playlist.title}</h2>
          <p className="text-muted">{playlist.artist}</p>
        </div>
        <div className="col-md-8">
          <ul className="list-group">
            {playlist.songs.map((song, index) => {
              // Check if this specific song is liked
              const isLiked = likedSongIds && likedSongIds.includes(song.id);

              return (
                <li
                  key={song.id}
                  className="list-group-item bg-dark text-white border-secondary d-flex justify-content-between align-items-center"
                >
                  {/* Song Info (Click to Play) */}
                  <div 
                    className="d-flex align-items-center flex-grow-1" 
                    style={{ cursor: 'pointer' }} 
                    onClick={() => onPlaySong(song)}
                  >
                    <span className="me-3 text-muted">{index + 1}</span>
                    <div>
                      <div className="fw-bold">{song.title}</div>
                      <small className="text-muted">{song.artist}</small>
                    </div>
                  </div>

                  {/* Actions: Like & Play */}
                  <div className="d-flex align-items-center">
                    {/* NEW: Heart Icon Button */}
                    <button 
                      className="btn btn-link me-3" 
                      onClick={(e) => { 
                        e.stopPropagation(); // Prevent clicking the row (Play) when clicking Heart
                        onToggleLike(song); 
                      }}
                      style={{ color: isLiked ? '#D97925' : '#6c757d', textDecoration: 'none' }}
                    >
                      <i className={`bi ${isLiked ? 'bi-heart-fill' : 'bi-heart'} fs-5`}></i>
                    </button>

                    <button className="btn btn-link text-white fs-4 p-0" onClick={() => onPlaySong(song)}>
                      <i className="bi bi-play-fill"></i>
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default PlaylistPage;