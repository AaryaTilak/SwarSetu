import React from 'react';

// Sample data for the categories
const categories = {
  moods: ['Happy', 'Sad', 'Energetic', 'Calm', 'Romantic', 'Focus'],
  timesOfDay: ['Morning', 'Afternoon', 'Evening', 'Night'],
  artists: ['Pt. Ajay Pohankar', 'Lata Mangeshkar', 'Kalapini Komkali', 'Pt. Jasraj', 'Dr. Prabha Atre', 'Anirudh Aithal'],
  instruments: ['Sitar', 'Tabla', 'Sarod', 'Flute', 'Violin', 'Piano'],
};

// A set of vibrant colors for the cards
const cardColors = ['#e74c3c', '#8e44ad', '#3498db', '#1abc9c', '#f1c40f', '#d35400', '#27ae60'];

const CategoryCard = ({ title, color }) => {
  const cardStyle = {
    backgroundColor: color,
    borderRadius: '8px',
    padding: '20px',
    textAlign: 'center',
    cursor: 'pointer',
    transition: 'transform 0.2s ease-in-out',
    minHeight: '100px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#fff',
    fontWeight: 'bold',
    fontSize: '1.1rem',
  };

  const [hover, setHover] = React.useState(false);

  return (
    <div
      style={hover ? { ...cardStyle, transform: 'scale(1.05)' } : cardStyle}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      {title}
    </div>
  );
};

const BrowsePage = () => {
  return (
    <div className="container text-white">
      <h1 className="mb-5">Browse All</h1>

      {/* Moods Section */}
      <section className="mb-5">
        <h3>By Mood</h3>
        <div className="row g-3 mt-2">
          {categories.moods.map((mood, index) => (
            <div className="col-6 col-md-4 col-lg-2" key={mood}>
              <CategoryCard title={mood} color={cardColors[index % cardColors.length]} />
            </div>
          ))}
        </div>
      </section>

      {/* Time of Day Section */}
      <section className="mb-5">
        <h3>By Time of Day</h3>
        <div className="row g-3 mt-2">
          {categories.timesOfDay.map((time, index) => (
            <div className="col-6 col-md-3" key={time}>
              <CategoryCard title={time} color={cardColors[(index + 2) % cardColors.length]} />
            </div>
          ))}
        </div>
      </section>
      
      {/* Artists Section */}
      <section className="mb-5">
        <h3>By Artists</h3>
        <div className="row g-3 mt-2">
          {categories.artists.map((artist, index) => (
            <div className="col-6 col-md-4 col-lg-2" key={artist}>
              <CategoryCard title={artist} color={cardColors[(index + 4) % cardColors.length]} />
            </div>
          ))}
        </div>
      </section>

      {/* Instruments Section */}
      <section className="mb-5">
        <h3>By Instruments</h3>
        <div className="row g-3 mt-2">
          {categories.instruments.map((instrument, index) => (
            <div className="col-6 col-md-4 col-lg-2" key={instrument}>
              <CategoryCard title={instrument} color={cardColors[(index + 1) % cardColors.length]} />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default BrowsePage;