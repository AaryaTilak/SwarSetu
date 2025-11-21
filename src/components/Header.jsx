import React from 'react';

const Header = ({ onNavigate, activePage, onLogout }) => {
  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark fixed-top">
      <div className="container-fluid">
        <a className="navbar-brand fw-bold" href="#" onClick={(e) => { e.preventDefault(); onNavigate('home'); }}>
          <i className="bi bi-music-note-beamed me-2"></i>SwarSetu
        </a>
        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarNav">
          {/* Main navigation links */}
          <ul className="navbar-nav me-auto">
            <li className="nav-item">
              <a className={`nav-link ${activePage === 'home' ? 'active' : ''}`} href="#" onClick={(e) => { e.preventDefault(); onNavigate('home'); }}>
                Home
              </a>
            </li>
            {/* <li className="nav-item">
              <a className={`nav-link ${activePage === 'browse' ? 'active' : ''}`} href="#" onClick={(e) => { e.preventDefault(); onNavigate('browse'); }}>
                Browse
              </a>
            </li> */}
            <li className="nav-item">
              <a className={`nav-link ${activePage === 'library' ? 'active' : ''}`} href="#" onClick={(e) => { e.preventDefault(); onNavigate('library'); }}>
                Library
              </a>
            </li>
            <li className="nav-item">
              <a className={`nav-link ${activePage === 'uploads' ? 'active' : ''}`} href="#" onClick={(e) => { e.preventDefault(); onNavigate('uploads'); }}>
                Uploads
              </a>
            </li>
          </ul>
          
          {/* Search form */}
          <form className="d-flex" role="search">
            <input className="form-control me-2 bg-dark text-white border-secondary" type="search" placeholder="Search for music..." />
          </form>

          {/* Profile Dropdown */}
          <ul className="navbar-nav">
            <li className="nav-item dropdown">
              <a 
                className="nav-link dropdown-toggle" 
                href="#" 
                role="button" 
                data-bs-toggle="dropdown" 
                aria-expanded="false"
              >
                <i className="bi bi-person-circle fs-4"></i>
              </a>
              <ul className="dropdown-menu dropdown-menu-dark dropdown-menu-end">
                <li>
                   <a className="dropdown-item" href="#" onClick={(e) => { e.preventDefault(); onNavigate('editProfile'); }}>
                     <i className="bi bi-pencil-square me-2"></i>Edit Profile
                   </a>
                 </li>
                 <li>
                   <a className="dropdown-item" href="#" onClick={(e) => { e.preventDefault(); onNavigate('settings'); }}>
                     <i className="bi bi-gear-fill me-2"></i>Settings
                   </a>
                 </li>
                <li><a className="dropdown-item" href="#"><i className="bi bi-shield-lock-fill me-2"></i>Privacy Policy</a></li>
                <li><hr className="dropdown-divider" /></li>
                
                {/* Updated Logout Link */}
                <li>
                    <a className="dropdown-item text-danger" href="#" onClick={(e) => { e.preventDefault(); onLogout(); }}>
                        <i className="bi bi-box-arrow-right me-2"></i>Logout
                    </a>
                </li>
              </ul>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Header;