import React from 'react';

const LibraryPage = ({ likedSongs, onPlaySong }) => {
  const backendUrl = 'http://localhost:4000';

  // 1. Empty State
  if (!likedSongs || likedSongs.length === 0) {
    return (
      <div className="container text-white text-center mt-5">
        <h1 className="mb-4">My Library</h1>
        <div className="p-5 border border-secondary rounded bg-dark">
          <i className="bi bi-heart fs-1 text-muted mb-3"></i>
          <h4>No Liked Songs Yet</h4>
          <p className="text-muted">Go explore and tap the heart icon on songs to add them here!</p>
        </div>
      </div>
    );
  }

  // 2. List of Liked Songs
  return (
    <div className="container text-white">
      <h1 className="mb-4">Liked Songs</h1>
      <div className="list-group">
        {likedSongs.map((song, index) => (
          <div 
            key={song.id} 
            className="list-group-item list-group-item-action bg-dark text-white border-secondary d-flex justify-content-between align-items-center"
            style={{ cursor: 'pointer' }}
            onClick={() => onPlaySong(song)}
          >
            <div className="d-flex align-items-center">
              <span className="me-3 text-muted" style={{ width: '20px' }}>{index + 1}</span>
              
              {/* Song Image */}
              <img 
                src={song.image_filename 
                    ? `${backendUrl}/uploads/${song.image_filename}` 
                    : '/assets/Ghazal.jpg'} // Fallback image
                alt={song.title} 
                className="me-3 rounded" 
                style={{ width: '50px', height: '50px', objectFit: 'cover' }}
                onError={(e) => e.target.src = 'https://via.placeholder.com/50'}
              />
              
              <div>
                <div className="fw-bold">{song.title}</div>
                <small className="text-muted">{song.artist}</small>
              </div>
            </div>
            
            <button className="btn btn-link text-white fs-4">
              <i className="bi bi-play-fill"></i>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LibraryPage;