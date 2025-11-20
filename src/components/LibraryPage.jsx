import React from 'react';
import MusicCard from './MusicCard'; // We can reuse the MusicCard component

// Sample data for the user's library
const userPlaylists = [
  { id: 1, title: 'Thumri Mix', artist: '45 songs', image: 'assets/Thumri.jpg' },
  { id: 2, title: 'Semi-classical Beats', artist: '30 songs', image: 'assets/SemiClassical.jpg' },
  { id: 3, title: 'Late Night Ghazals', artist: '88 songs', image: 'assets/Ghazal.jpg' },
  { id: 4, title: 'Classical Focus', artist: '50 songs', image: 'assets/ClassicalFocus.jpg' },
];

const recommendations = [
    { id: 1, title: 'Discover Weekly', artist: 'Curated for you', image: 'assets/DiscoverWeekly.jpg'},
    { id: 2, title: 'Release Radar', artist: 'New tracks', image: 'assets/NewReleases.jpg'},
];

const LibraryPage = () => {
  // Custom style for the special "Liked Songs" card
  const likedSongsCardStyle = {
    background: 'linear-gradient(135deg, #ef3fa3ff, #e65a37ff, #4f9bfeff)',
    minHeight: '200px',
    cursor: 'pointer',
    transition: 'transform 0.2s ease-in-out',
  };
  
  const [hover, setHover] = React.useState(false);

  return (
    <div className="container text-white">
      <h1 className="mb-5">My Library</h1>

      {/* Main Collections Section */}
      <div className="row mb-5">
        <div className="col-12">
           <div 
            className="card p-4 h-100 d-flex flex-column justify-content-end" 
            style={hover ? {...likedSongsCardStyle, transform: 'scale(1.02)'} : likedSongsCardStyle}
            onMouseEnter={() => setHover(true)}
            onMouseLeave={() => setHover(false)}
           >
            <i className="bi bi-heart-fill fs-1 mb-3"></i>
            <h2 className="card-title">Liked Songs</h2>
            <p className="card-text">128 songs</p>
          </div>
        </div>
      </div>

      {/* User Playlists Grid */}
      <section className="mb-5">
        <h3>My Playlists</h3>
        <div className="row g-3 mt-2">
          {userPlaylists.map(playlist => (
            <div className="col-6 col-md-4 col-lg-3" key={playlist.id}>
              <MusicCard
                image={playlist.image}
                title={playlist.title}
                artist={playlist.artist}
              />
            </div>
          ))}
        </div>
      </section>
      
      {/* Recommendations Grid */}
      <section className="mb-5">
        <h3>Recommendations</h3>
        <div className="row g-3 mt-2">
          {recommendations.map(rec => (
            <div className="col-6 col-md-4 col-lg-3" key={rec.id}>
              <MusicCard
                image={rec.image}
                title={rec.title}
                artist={rec.artist}
              />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default LibraryPage;