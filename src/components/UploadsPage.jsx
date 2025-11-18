import React, { useState, useRef } from 'react';

const UploadsPage = ({ uploadedSongs, onUpload, onDelete }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [message, setMessage] = useState('');
  
  // New state for title and artist
  const [title, setTitle] = useState('');
  const [artist, setArtist] = useState('');

  const fileInputRef = useRef(null);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file && file.type.startsWith('audio/')) {
      setSelectedFile(file);
      setMessage('');
    } else {
      setSelectedFile(null);
      setMessage('Please select a valid audio file (e.g., MP3, WAV).');
    }
  };
  
  const handleUpload = async () => {
    if (!selectedFile || !title || !artist) {
      setMessage('Please provide a title, artist, and audio file.');
      return;
    }

    // Create a FormData object to send all data
    const formData = new FormData();
    formData.append('title', title);
    formData.append('artist', artist);
    formData.append('audio', selectedFile);

    try {
      // Call the onUpload function (from App.jsx)
      const successMessage = await onUpload(formData);
      setMessage(successMessage);
      
      // Reset form on success
      setSelectedFile(null);
      setTitle('');
      setArtist('');
      fileInputRef.current.value = null;
    } catch (error) {
      setMessage(`Upload failed: ${error.message}`);
    }

    // Clear the message after 3 seconds
    setTimeout(() => setMessage(''), 3000);
  };

  return (
    <div className="container text-white">
      <h1 className="mb-4">Upload Your Music</h1>
      
      <div className="card bg-dark border-secondary p-4 p-md-5">
        <div className="card-body">
            
            {/* New Form Inputs for Title and Artist */}
            <div className="mb-3">
              <label htmlFor="title" className="form-label">Song Title</label>
              <input 
                type="text" 
                className="form-control bg-dark text-white border-secondary" 
                id="title" 
                value={title} 
                onChange={(e) => setTitle(e.target.value)} 
              />
            </div>
            <div className="mb-3">
              <label htmlFor="artist" className="form-label">Artist Name</label>
              <input 
                type="text" 
                className="form-control bg-dark text-white border-secondary" 
                id="artist" 
                value={artist} 
                onChange={(e) => setArtist(e.target.value)} 
              />
            </div>
            
            {/* File Input */}
            <div 
              className="border border-3 border-dashed border-secondary rounded-3 p-5 text-center"
              onClick={() => fileInputRef.current.click()}
              style={{cursor: 'pointer'}}
            >
              <input 
                type="file" 
                accept="audio/*" 
                onChange={handleFileChange} 
                className="d-none"
                ref={fileInputRef}
              />
              <i className="bi bi-cloud-arrow-up-fill text-secondary" style={{fontSize: '4rem'}}></i>
              <p className="mt-3 mb-0">Drag & drop or <span className="text-primary fw-bold">click to browse</span></p>
            </div>
          
            {selectedFile && (
              <div className="alert alert-info mt-4">
                Selected: <strong>{selectedFile.name}</strong>
              </div>
            )}
            
            {message && (
              <div className={`alert ${message.includes('failed') ? 'alert-danger' : 'alert-success'} mt-4`}>
                {message}
              </div>
            )}

            <button 
                className="btn btn-primary btn-lg mt-4 w-100" 
                onClick={handleUpload}
                disabled={!selectedFile || !title || !artist}
            >
                <i className="bi bi-upload me-2"></i>Upload Song
            </button>
        </div>
      </div>
      
      {/* My Uploads List (now shows real data) */}
      <div className="mt-5">
        <h3 className="mb-3">My Uploads</h3>
        {uploadedSongs.length > 0 ? (
          <ul className="list-group">
            {uploadedSongs.map(song => (
              <li key={song.id} className="list-group-item bg-dark text-white border-secondary d-flex justify-content-between align-items-center">
                <span><i className="bi bi-music-note me-3"></i>{song.title} - {song.artist}</span>
                <button className="btn btn-sm btn-outline-danger" onClick={() => onDelete(song.id)}>
                  <i className="bi bi-trash"></i>
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-muted">You haven't uploaded any songs yet.</p>
        )}
      </div>
    </div>
  );
};

export default UploadsPage;