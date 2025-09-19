import React, { useState, useRef } from 'react';

const UploadsPage = ({ uploadedSongs, onUpload, onDelete }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [message, setMessage] = useState('');
  const fileInputRef = useRef(null);

  // Handles the file selection from the input
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
  
  // Simulates the upload process
  const handleUpload = () => {
    if (!selectedFile) return;

    // Call the onUpload function from App.jsx
    onUpload(selectedFile);
    
    // Reset the local state and show a success message
    setSelectedFile(null);
    setMessage(`Successfully uploaded "${selectedFile.name}"!`);
    fileInputRef.current.value = null; 

    setTimeout(() => setMessage(''), 3000);
  };

  return (
    <div className="container text-white">
      <h1 className="mb-4">Upload Your Music</h1>
      <p className="text-muted mb-5">Add your favorite tracks to your library.</p>
      
      <div className="card bg-dark border-secondary p-4 p-md-5">
        <div className="card-body text-center">
            {/* The actual file input is hidden but can be triggered */}
            <input 
              type="file" 
              accept="audio/*" 
              onChange={handleFileChange} 
              className="d-none"
              ref={fileInputRef}
            />

            {/* A styled label acts as the clickable upload area */}
            <div 
              className="border border-3 border-dashed border-secondary rounded-3 p-5"
              onClick={() => fileInputRef.current.click()} // Click the hidden input
              style={{cursor: 'pointer'}}
            >
              <i className="bi bi-cloud-arrow-up-fill text-secondary" style={{fontSize: '4rem'}}></i>
              <p className="mt-3 mb-0">Drag & drop files here or <span className="text-primary fw-bold">click to browse</span></p>
            </div>
          
            {/* Display the selected file name */}
            {selectedFile && (
              <div className="alert alert-info mt-4">
                Selected: <strong>{selectedFile.name}</strong>
              </div>
            )}
            
            {/* Display success or error messages */}
            {message && (
              <div className={`alert ${message.includes('Successfully') ? 'alert-success' : 'alert-danger'} mt-4`}>
                {message}
              </div>
            )}

            <button 
                className="btn btn-primary btn-lg mt-4" 
                onClick={handleUpload}
                disabled={!selectedFile}
            >
                <i className="bi bi-upload me-2"></i>Upload Song
            </button>
        </div>
      </div>
      
      {/* Display the list of uploaded songs */}
      <div className="mt-5">
        <h3 className="mb-3">My Uploads</h3>
        {uploadedSongs.length > 0 ? (
          <ul className="list-group">
            {uploadedSongs.map(song => (
              <li key={song.id} className="list-group-item bg-dark text-white border-secondary d-flex justify-content-between align-items-center">
                <span><i className="bi bi-music-note me-3"></i>{song.name}</span>
                {/* Use the onDelete function from props */}
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