import React, { useState, useRef } from 'react';

const UploadsPage = ({ uploadedSongs, onUpload, onDelete }) => {
  const [audioFile, setAudioFile] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [message, setMessage] = useState('');
  
  // Form Inputs
  const [title, setTitle] = useState('');
  const [artist, setArtist] = useState('');
  // Default category
  const [category, setCategory] = useState('New Releases'); 

  const audioInputRef = useRef(null);
  const imageInputRef = useRef(null);

  const handleUpload = async () => {
    if (!audioFile || !title || !artist || !category) {
      setMessage('Please fill in all fields and select an audio file.');
      return;
    }

    const formData = new FormData();
    formData.append('title', title);
    formData.append('artist', artist);
    formData.append('category', category); // Send Category to Backend
    formData.append('audio', audioFile);
    
    if (imageFile) {
        formData.append('image', imageFile);
    }

    try {
      const successMessage = await onUpload(formData);
      setMessage(successMessage);
      
      // Reset Form
      setAudioFile(null); setImageFile(null); 
      setTitle(''); setArtist(''); setCategory('New Releases');
      if(audioInputRef.current) audioInputRef.current.value = null;
      if(imageInputRef.current) imageInputRef.current.value = null;
    } catch (error) {
      setMessage(`Upload failed: ${error.message}`);
    }
    setTimeout(() => setMessage(''), 3000);
  };

  return (
    <div className="container text-white">
      <h1 className="mb-4">Upload Your Music</h1>
      
      <div className="card bg-dark border-secondary p-4">
        <div className="card-body">
            {/* Title & Artist */}
            <div className="mb-3">
                <label className="form-label">Song Title</label>
                <input type="text" className="form-control bg-dark text-white border-secondary" value={title} onChange={(e) => setTitle(e.target.value)} />
            </div>
            <div className="mb-3">
                <label className="form-label">Artist Name</label>
                <input type="text" className="form-control bg-dark text-white border-secondary" value={artist} onChange={(e) => setArtist(e.target.value)} />
            </div>
            
            {/* NEW: Category Dropdown */}
            <div className="mb-3">
                <label className="form-label">Category</label>
                <select 
                    className="form-select bg-dark text-white border-secondary" 
                    value={category} 
                    onChange={(e) => setCategory(e.target.value)}
                >
                    <option value="New Releases">New Releases (General)</option>
                    <option value="Classical">Classical</option>
                    <option value="Semi-Classical">Semi-Classical</option>
                </select>
            </div>

            {/* File Inputs */}
            <div className="mb-3">
                <label className="form-label">Audio File (Required)</label>
                <input type="file" accept="audio/*" className="form-control bg-dark text-white border-secondary" onChange={(e) => setAudioFile(e.target.files[0])} ref={audioInputRef} />
            </div>
            
            <div className="mb-4">
                <label className="form-label">Cover Art (Optional)</label>
                <input type="file" accept="image/*" className="form-control bg-dark text-white border-secondary" onChange={(e) => setImageFile(e.target.files[0])} ref={imageInputRef} />
            </div>

            <button className="btn btn-primary w-100" onClick={handleUpload} disabled={!audioFile || !title || !artist}>Upload Song</button>
            
            {message && <div className={`alert mt-3 ${message.includes('failed') ? 'alert-danger' : 'alert-success'}`}>{message}</div>}
        </div>
      </div>
      
      {/* List of Uploads */}
      <div className="mt-5">
        <h3 className="mb-3">My Uploads</h3>
        <ul className="list-group">
            {uploadedSongs.map(song => (
              <li key={song.id} className="list-group-item bg-dark text-white border-secondary d-flex justify-content-between align-items-center">
                <div className="d-flex align-items-center">
                    <span className="badge bg-secondary me-3">{song.category || 'Music'}</span>
                    <span>{song.title} - {song.artist}</span>
                </div>
                <button className="btn btn-sm btn-outline-danger" onClick={() => onDelete(song.id)}><i className="bi bi-trash"></i></button>
              </li>
            ))}
        </ul>
      </div>
    </div>
  );
};

export default UploadsPage;