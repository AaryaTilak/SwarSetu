import React from 'react';

const PlaylistPage = ({ playlist, onPlaySong, onBack }) => {
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
            {playlist.songs.map((song, index) => (
              <li
                key={song.id}
                className="list-group-item list-group-item-action bg-dark text-white border-secondary d-flex justify-content-between align-items-center"
                style={{ cursor: 'pointer' }}
                onClick={() => onPlaySong(song)}
              >
                <div className="d-flex align-items-center">
                  <span className="me-3 text-muted">{index + 1}</span>
                  <div>
                    <div className="fw-bold">{song.title}</div>
                    <small>{song.artist}</small>
                  </div>
                </div>
                <button className="btn btn-link text-white fs-4 p-0">
                  <i className="bi bi-play-fill"></i>
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default PlaylistPage;