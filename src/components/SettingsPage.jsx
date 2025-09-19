import React, { useState } from 'react';

// Default settings for the user
const initialSettings = {
  audioQuality: 'High',
  autoplay: true,
  crossfade: 8, // in seconds
  showExplicit: false,
  language: 'English',
};

const SettingsPage = ({ onNavigate }) => {
  const [settings, setSettings] = useState(initialSettings);

  // A generic handler for all settings changes
  const handleSettingChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettings(prevSettings => ({
      ...prevSettings,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  return (
    <div className="container text-white">
      <h1 className="mb-5">Settings</h1>

      {/* Account Section */}
      <h3 className="mb-3">Account</h3>
      <div className="list-group mb-5">
        <a href="#" onClick={(e) => { e.preventDefault(); onNavigate('editProfile'); }} className="list-group-item list-group-item-action bg-dark text-white border-secondary d-flex justify-content-between align-items-center">
          Edit Profile
          <i className="bi bi-chevron-right"></i>
        </a>
        <a href="#" className="list-group-item list-group-item-action bg-dark text-white border-secondary d-flex justify-content-between align-items-center">
          Change Password
          <i className="bi bi-chevron-right"></i>
        </a>
      </div>

      {/* Playback Section */}
      <h3 className="mb-3">Playback</h3>
      <div className="list-group mb-5">
        <div className="list-group-item bg-dark text-white border-secondary d-flex justify-content-between align-items-center">
          <label htmlFor="audioQuality" className="form-label mb-0">Audio Quality</label>
          <select 
            className="form-select bg-dark text-white w-50" 
            id="audioQuality" 
            name="audioQuality"
            value={settings.audioQuality}
            onChange={handleSettingChange}
          >
            <option>Low</option>
            <option>Medium</option>
            <option>High</option>
            <option>Very High</option>
          </select>
        </div>
        <div className="list-group-item bg-dark text-white border-secondary d-flex justify-content-between align-items-center">
          <label className="form-label mb-0">Crossfade</label>
          <div className="d-flex align-items-center w-50">
            <input 
              type="range" 
              className="form-range me-3" 
              min="0" 
              max="12" 
              step="1" 
              id="crossfade"
              name="crossfade"
              value={settings.crossfade}
              onChange={handleSettingChange}
            />
            <span>{settings.crossfade}s</span>
          </div>
        </div>
        <div className="list-group-item bg-dark text-white border-secondary d-flex justify-content-between align-items-center form-check form-switch pe-0">
          <label className="form-check-label" htmlFor="autoplay">Enable Autoplay</label>
          <input 
            className="form-check-input" 
            type="checkbox" 
            role="switch" 
            id="autoplay" 
            name="autoplay"
            checked={settings.autoplay}
            onChange={handleSettingChange}
          />
        </div>
        <div className="list-group-item bg-dark text-white border-secondary d-flex justify-content-between align-items-center form-check form-switch pe-0">
          <label className="form-check-label" htmlFor="showExplicit">Show Explicit Content</label>
          <input 
            className="form-check-input" 
            type="checkbox" 
            role="switch" 
            id="showExplicit" 
            name="showExplicit"
            checked={settings.showExplicit}
            onChange={handleSettingChange}
          />
        </div>
      </div>
      
       {/* About Section */}
      <h3 className="mb-3">About</h3>
       <div className="list-group">
        <a href="#" className="list-group-item list-group-item-action bg-dark text-white border-secondary d-flex justify-content-between align-items-center">
          Privacy Policy
          <i className="bi bi-box-arrow-up-right"></i>
        </a>
        <a href="#" className="list-group-item list-group-item-action bg-dark text-white border-secondary d-flex justify-content-between align-items-center">
          Terms of Service
          <i className="bi bi-box-arrow-up-right"></i>
        </a>
      </div>
    </div>
  );
};

export default SettingsPage;