import React, { useState } from 'react';

// Mock data for the current user's profile
const currentUser = {
  fullName: 'Aarya Tilak',
  email: 'aaryatilak@gmail.com',
  phone: '+91 9022245673',
  bio: 'Music lover. Creator of playlists. Always looking for the next great track.',
  profilePic: 'https://i.pravatar.cc/150?u=alexray',
};

// The component receives props to display and delete uploads
const EditProfilePage = ({ onNavigate, uploadedSongs, onDelete }) => {
  const [profileData, setProfileData] = useState(currentUser);
  const [message, setMessage] = useState('');

  // Handles changes in form inputs
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prevData => ({
      ...prevData,
      [name]: value,
    }));
  };

  // Handles the form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Updated Profile Data:', profileData);
    setMessage('Profile updated successfully!');
    setTimeout(() => setMessage(''), 3000);
  };

  return (
    <div className="container text-white">
      <h1 className="mb-4">Edit Profile</h1>
      
      {message && <div className="alert alert-success">{message}</div>}

      <form onSubmit={handleSubmit}>
        <div className="row">
          {/* Profile Picture Section */}
          <div className="col-md-4 text-center mb-4">
            <img 
              src={profileData.profilePic} 
              alt="Profile" 
              className="img-fluid rounded-circle mb-3"
              style={{ width: '150px', height: '150px' }}
            />
            <button type="button" className="btn btn-outline-light">Change Photo</button>
          </div>

          {/* Form Fields Section */}
          <div className="col-md-8">
            <div className="mb-3">
              <label htmlFor="fullName" className="form-label">Full Name</label>
              <input 
                type="text" 
                className="form-control bg-dark text-white border-secondary" 
                id="fullName" 
                name="fullName"
                value={profileData.fullName}
                onChange={handleInputChange}
              />
            </div>
            <div className="mb-3">
              <label htmlFor="email" className="form-label">Email Address</label>
              <input 
                type="email" 
                className="form-control bg-dark text-white border-secondary" 
                id="email" 
                name="email"
                value={profileData.email}
                onChange={handleInputChange}
                readOnly
              />
              <small className="form-text text-muted">Your email address is not editable.</small>
            </div>
            <div className="mb-3">
              <label htmlFor="phone" className="form-label">Phone Number</label>
              <input 
                type="tel" 
                className="form-control bg-dark text-white border-secondary" 
                id="phone" 
                name="phone"
                value={profileData.phone}
                onChange={handleInputChange}
              />
            </div>
             <div className="mb-3">
              <label htmlFor="bio" className="form-label">About Me</label>
              <textarea 
                className="form-control bg-dark text-white border-secondary" 
                id="bio"
                name="bio"
                rows="3"
                value={profileData.bio}
                onChange={handleInputChange}
              ></textarea>
            </div>
            <div className="mt-4">
              <button type="submit" className="btn btn-primary me-2">Save Changes</button>
              <button type="button" className="btn btn-secondary" onClick={() => onNavigate('home')}>Cancel</button>
            </div>
          </div>
        </div>
      </form>

      <hr className="my-5" />

      {/* Manage Uploads Section */}
      <div className="manage-uploads">
        <h3 className="mb-3">Manage Uploads</h3>
        {uploadedSongs.length > 0 ? (
          <ul className="list-group">
            {uploadedSongs.map(song => (
              <li key={song.id} className="list-group-item bg-dark text-white border-secondary d-flex justify-content-between align-items-center">
                <span><i className="bi bi-music-note me-3"></i>{song.name}</span>
                <button className="btn btn-sm btn-outline-danger" onClick={() => onDelete(song.id)}>
                  <i className="bi bi-trash me-2"></i>Delete
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
}; // <-- This is the curly brace that was likely missing

export default EditProfilePage;