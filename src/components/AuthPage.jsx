import React, { useState } from 'react';

// Updated to accept both onLogin and onSignup functions
const AuthPage = ({ onLogin, onSignup }) => {
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Basic Validation
    if (!formData.email || !formData.password) {
      setError('Please fill in all fields.');
      return;
    }

    if (!isLoginMode && !formData.name) {
      setError('Please enter your name.');
      return;
    }

    // Logic to switch between Login and Signup functions
    if (isLoginMode) {
      // Call the login function passed from App.jsx
      await onLogin(formData.email, formData.password);
    } else {
      // Call the signup function passed from App.jsx
      await onSignup(formData.name, formData.email, formData.password);
    }
  };

  return (
    <div className="d-flex justify-content-center align-items-center vh-100" style={{ backgroundColor: '#121212' }}>
      <div className="card bg-dark text-white border-secondary p-4" style={{ width: '100%', maxWidth: '400px' }}>
        <div className="text-center mb-4">
            <i className="bi bi-music-note-beamed text-primary" style={{ fontSize: '3rem' }}></i>
            <h2 className="fw-bold mt-2">SwarSetu</h2>
            <p className="text-muted">Stream Indian Classical & More</p>
        </div>

        <h4 className="text-center mb-4">{isLoginMode ? 'Welcome Back' : 'Create Account'}</h4>

        {error && <div className="alert alert-danger py-2">{error}</div>}

        <form onSubmit={handleSubmit}>
          {!isLoginMode && (
            <div className="mb-3">
              <label className="form-label">Full Name</label>
              <div className="input-group">
                <span className="input-group-text bg-secondary border-secondary text-white"><i className="bi bi-person"></i></span>
                <input 
                  type="text" 
                  className="form-control bg-dark text-white border-secondary" 
                  placeholder="Enter your name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                />
              </div>
            </div>
          )}

          <div className="mb-3">
            <label className="form-label">Email Address</label>
            <div className="input-group">
              <span className="input-group-text bg-secondary border-secondary text-white"><i className="bi bi-envelope"></i></span>
              <input 
                type="email" 
                className="form-control bg-dark text-white border-secondary" 
                placeholder="name@example.com"
                name="email"
                value={formData.email}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="form-label">Password</label>
            <div className="input-group">
              <span className="input-group-text bg-secondary border-secondary text-white"><i className="bi bi-lock"></i></span>
              <input 
                type="password" 
                className="form-control bg-dark text-white border-secondary" 
                placeholder="••••••••"
                name="password"
                value={formData.password}
                onChange={handleChange}
              />
            </div>
          </div>

          <button type="submit" className="btn btn-primary w-100 py-2 fw-bold">
            {isLoginMode ? 'Log In' : 'Sign Up'}
          </button>
        </form>

        <div className="text-center mt-4">
          <p className="mb-0 text-muted">
            {isLoginMode ? "Don't have an account? " : "Already have an account? "}
            <button 
              className="btn btn-link text-primary p-0 text-decoration-none fw-bold" 
              onClick={() => { setIsLoginMode(!isLoginMode); setError(''); }}
            >
              {isLoginMode ? 'Sign Up' : 'Log In'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;