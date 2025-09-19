import React from 'react';

const cardStyle = {
  transition: 'transform 0.2s ease-in-out',
};

const cardHoverStyle = {
  transform: 'scale(1.05)',
};

const MusicCard = ({ image, title, artist }) => {
  const [hover, setHover] = React.useState(false);

  return (
    <div
      className="card bg-dark text-white border-0 h-100"
      style={hover ? { ...cardStyle, ...cardHoverStyle } : cardStyle}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <img src={image} className="card-img-top" alt={title} />
      <div className="card-body">
        <h6 className="card-title text-truncate">{title}</h6>
        <p className="card-text text-muted small">{artist}</p>
      </div>
    </div>
  );
};

export default MusicCard;