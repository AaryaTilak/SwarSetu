import React from 'react';
import MusicCard from './MusicCard';

const MusicCarousel = ({ title, data, onPlaylistClick }) => {
  return (
    <div className="mb-5">
      <h2 className="text-white mb-4">{title}</h2>
      <div className="d-flex gap-3" style={{ overflowX: 'auto', paddingBottom: '1rem' }}>
        {data.map(item => (
          <div
            key={item.id}
            style={{ minWidth: '180px', cursor: 'pointer' }}
            onClick={() => onPlaylistClick(item)}
          >
            <MusicCard image={item.image} title={item.title} artist={item.artist} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default MusicCarousel;