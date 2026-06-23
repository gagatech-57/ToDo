import React, { useState } from 'react';
import { Lock, Mail, User, ShieldAlert, CheckSquare, Square, ArrowRight, Sun, Moon, X } from 'lucide-react';

export default function Auth({ onLogin, theme, toggleTheme }) {
  const [rememberedAccounts, setRememberedAccounts] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('gaga_remembered_accounts') || '[]');
    } catch {
      return [];
    }
  });

  const saveRememberedAccount = (userObj) => {
    if (!userObj || !userObj.id || userObj.id === 'guest') return;
    try {
      const list = JSON.parse(localStorage.getItem('gaga_remembered_accounts') || '[]');
      const exists = list.some(u => u.id === userObj.id || u.email === userObj.email);
      if (!exists) {
        const updated = [...list, { id: userObj.id, name: userObj.name, email: userObj.email }];
        setRememberedAccounts(updated);
        localStorage.setItem('gaga_remembered_accounts', JSON.stringify(updated));
      }
    } catch (err) {
      console.error('Error saving remembered account:', err);
    }
  };

  const handleForgetAccount = (e, userId) => {
    e.stopPropagation();
    const updated = rememberedAccounts.filter(u => u.id !== userId);
    setRememberedAccounts(updated);
    localStorage.setItem('gaga_remembered_accounts', JSON.stringify(updated));
  };
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
      saveRememberedAccount(data.user);
      onLogin(data.user, !isLogin);
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
        <div className="auth-card-header" style={{ marginBottom: '24px', position: 'relative', display: 'flex', justifyContent: 'center' }}>
          <div className="logo-wrapper">
            <div className="infinity-bg">
              <svg viewBox="0 0 100 50" className="infinity-svg">
                <defs>
                  <linearGradient id="infinity-grad-auth" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="var(--infinity-start)" />
                    <stop offset="100%" stopColor="var(--infinity-end)" />
                  </linearGradient>
                </defs>
                <path 
                  d="M50,25 C32,7 14,7 14,25 C14,43 32,43 50,25 C68,7 86,7 86,25 C86,43 68,43 50,25 Z" 
                  fill="none" 
                  stroke="url(#infinity-grad-auth)" 
                  strokeWidth="4"
                  className="infinity-path"
                />
              </svg>
            </div>
            <h2 className="auth-logo" style={{ margin: 0 }}>
              <span className="logo-gaga">Gaga</span>
              <span className="logo-todo">ToDo</span>
            </h2>
          </div>
        </div>

        {/* Remembered Accounts Section */}
        {rememberedAccounts.length > 0 && (
          <div className="remembered-accounts-section" style={{ marginBottom: '24px' }}>
            <p className="remembered-title" style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '10px', textAlign: 'left' }}>
              Continue with a saved account:
            </p>
            <div className="remembered-list" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {rememberedAccounts.map(account => (
                <div 
                  key={account.id} 
                  className="remembered-account-item glass-panel"
                  onClick={() => onLogin(account)}
                  style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    padding: '10px 14px', 
                    borderRadius: '14px', 
                    cursor: 'pointer',
                    transition: 'transform var(--transition-fast), background var(--transition-fast)'
                  }}
                >
                  <span className="profile-avatar" style={{ marginRight: '12px', width: '32px', height: '32px', fontSize: '0.9rem' }}>
                    {account.name.charAt(0).toUpperCase()}
                  </span>
                  <div style={{ textAlign: 'left', flex: 1 }}>
                    <div style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-primary)' }}>{account.name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{account.email}</div>
                  </div>
                  <button
                    type="button"
                    className="btn-icon forget-account-btn"
                    onClick={(e) => handleForgetAccount(e, account.id)}
                    title="Forget account"
                    style={{ width: '24px', height: '24px', border: 'none', background: 'transparent' }}
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

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
