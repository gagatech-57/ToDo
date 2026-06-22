import React, { useState } from 'react';
import { Lock, Mail, User, ShieldAlert, CheckSquare, Square, ArrowRight, Sun, Moon } from 'lucide-react';

export default function Auth({ onLogin, theme, toggleTheme }) {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Switch tabs
  const handleTabChange = (loginState) => {
    setIsLogin(loginState);
    setError('');
    setName('');
    setEmail('');
    setPassword('');
    setTermsAccepted(false);
  };

  // Submit Login/Registration
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!email.trim() || !password.trim()) {
      setError('Please fill in all credentials.');
      return;
    }

    if (!isLogin) {
      if (!name.trim()) {
        setError('Please enter your name.');
        return;
      }
      
      // Terms Validation
      if (!termsAccepted) {
        setError('You must accept the Terms & Conditions to create an account.');
        return;
      }
    }

    setLoading(true);

    const url = isLogin 
      ? 'https://gagaflow.onrender.com/api/auth/login' 
      : 'https://gagaflow.onrender.com/api/auth/register';
      
    const payload = isLogin 
      ? { email, password } 
      : { name, email, password };

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Connection failed. Please try again.');
      }

      // Success
      onLogin(data.user);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };



  return (
    <div className="auth-wrapper fade-in">
      {/* Floating background decorative blobs */}
      <div className="glass-bg-blobs">
        <div className="blob blob-1"></div>
        <div className="blob blob-2"></div>
      </div>

      <div className="auth-header-controls">
        {/* Simple Theme Toggle */}
        <button className="btn-icon" onClick={toggleTheme}>
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>
      </div>

      <div className="auth-card glass-panel">
        <div className="auth-card-header" style={{ marginBottom: '24px' }}>
          <h2>GAGA Flow</h2>
        </div>

        {/* Tab Selectors */}
        <div className="auth-tabs">
          <button 
            className={`auth-tab ${isLogin ? 'active' : ''}`}
            onClick={() => handleTabChange(true)}
          >
            Sign In
          </button>
          <button 
            className={`auth-tab ${!isLogin ? 'active' : ''}`}
            onClick={() => handleTabChange(false)}
          >
            Create Account
          </button>
        </div>

        {/* Error Banner */}
        {error && (
          <div className="auth-error-banner scale-in">
            <ShieldAlert size={16} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          {/* Name Field (Register Only) */}
          {!isLogin && (
            <div className="form-group">
              <label htmlFor="auth-name">Name</label>
              <div className="auth-input-wrapper">
                <User size={16} className="auth-input-icon" />
                <input
                  id="auth-name"
                  type="text"
                  placeholder="Your name"
                  className="form-input"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  maxLength={30}
                  required
                />
              </div>
            </div>
          )}

          {/* Email Field */}
          <div className="form-group">
            <label htmlFor="auth-email">Email Address</label>
            <div className="auth-input-wrapper">
              <Mail size={16} className="auth-input-icon" />
              <input
                id="auth-email"
                type="email"
                placeholder="example@email.com"
                className="form-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Password Field */}
          <div className="form-group">
            <label htmlFor="auth-password">Password</label>
            <div className="auth-input-wrapper">
              <Lock size={16} className="auth-input-icon" />
              <input
                id="auth-password"
                type="password"
                placeholder="••••••••"
                className="form-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Terms & Conditions Checkbox (Register Only) */}
          {!isLogin && (
            <div className="auth-terms-row">
              <label className="auth-checkbox-label">
                <input 
                  type="checkbox"
                  checked={termsAccepted}
                  onChange={(e) => setTermsAccepted(e.target.checked)}
                />
                <span className={`auth-custom-checkbox ${termsAccepted ? 'checked' : ''}`}>
                  {termsAccepted ? <CheckSquare size={16} style={{ color: 'var(--success)' }} /> : <Square size={16} />}
                </span>
                <span className="auth-terms-text">I accept the Terms and Conditions</span>
              </label>
            </div>
          )}

          {/* Submit Action */}
          <button 
            type="submit" 
            className="btn btn-primary auth-submit-btn" 
            disabled={loading}
          >
            <span>{loading ? 'Connecting...' : isLogin ? 'Sign In' : 'Create Account'}</span>
            {!loading && <ArrowRight size={16} />}
          </button>
        </form>

        
        
      </div>
    </div>
  );
}
