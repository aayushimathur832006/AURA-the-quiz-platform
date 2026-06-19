import React, { useState } from 'react';

const AuthGateway = () => {
  const [isLogin, setIsLogin] = useState(true); 
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState({ type: '', text: '' });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });
    setIsLoading(true);

    const endpoint = isLogin ? '/api/login' : '/api/signup';
    const payload = isLogin ? { email, password } : { name, email, password };

    try {
      const response = await fetch(`https://aura-the-quiz-platform.onrender.com${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

  if (response.ok && data.success) {
      if (data.token) {
        localStorage.setItem('aura-token', data.token);

        localStorage.setItem('aura-user', JSON.stringify({ 
          email: email, 
          name: email 
        }));

        setMessage({ 
          type: 'success', 
          text: isLogin ? 'CONNECTION ESTABLISHED! ACCESS GRANTED..' : 'USER REGISTERED!' 
        });

        setTimeout(() => {
          window.location.reload();
        }, 1000);
      }
    } else {
      setMessage({ type: 'error', text: data.message || 'MAINFRAME REJECTED ACCESS' });
    }
  } catch (error) {
    setMessage({ type: 'error', text: 'SERVER OFFLINE. START YOUR USER BACKEND!' });
  } finally {
    setIsLoading(false);
  }
};

 
  const switchToRegister = () => {
    setIsLogin(false);
    setMessage({ type: '', text: '' });
  };

  const switchToLogin = () => {
    setIsLogin(true);
    setMessage({ type: '', text: '' });
  };

  return (
    <div className="form-shell-center animate-fade">
      <div className="canvas-matrix">
        <div className="matrix-grid"></div>
        <div className="glow-orb-1"></div>
        <div className="glow-orb-2"></div>
      </div>
      
      <div className="auth-glass-card quiz-glass-panel">
        <div className="badge-indicator">
          <span className="pulse-node"></span>
          <span>{isLogin ? 'CORE LINK AUTH' : 'CORE REGISTRATION'}</span>
        </div>

        <h1 className="h1-display">AURA <span>ENGINE</span></h1>
        <p className="p-desc" style={{ marginTop: '0.5rem', marginBottom: '1.5rem' }}>
          {isLogin ? 'ESTABLISH SECURE CONNECTION' : 'CREATE NEW USER SYSTEM ACCESS'}
        </p>

        {message.text && (
          <div 
            style={{
              padding: '0.85rem 1.25rem',
              borderRadius: '12px',
              fontSize: '0.75rem',
              fontWeight: '800',
              marginBottom: '1.5rem',
              textAlign: 'left',
              fontFamily: 'monospace',
              border: '1px solid',
              backgroundColor: message.type === 'error' ? 'var(--neon-pink-glow)' : 'rgba(2, 132, 199, 0.08)',
              color: message.type === 'error' ? 'var(--neon-pink)' : 'var(--neon-cyan)',
              borderColor: message.type === 'error' ? 'rgba(225, 29, 72, 0.2)' : 'rgba(2, 132, 199, 0.2)'
            }}
          >
            {message.type === 'error' ? '⚠️ EXCEPTION: ' : '✅ SUCCESS: '}
            {message.text.toUpperCase()}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <div className="form-group">
              <label className="form-label">User Display Name</label>
              <input 
                type="text" 
                className="form-input"
                placeholder="Enter elite username" 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                required 
              />
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Mainframe Email</label>
            <input 
              type="email" 
              className="form-input"
              placeholder="name@example.com" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              required 
            />
          </div>

          <div className="form-group">
            <label className="form-label">Security Key</label>
            <input 
              type="password" 
              className="form-input"
              placeholder="••••••••" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              required 
            />
          </div>

          <button 
            type="submit" 
            className="btn-asymmetric-primary w-full" 
            disabled={isLoading}
            style={{ marginTop: '0.5rem' }}
          >
            {isLoading ? 'PROCESSING USER...' : isLogin ? 'Login' : 'Register New Node'}
          </button>
        </form>

        <p className="auth-footer-note">
          {isLogin ? (
            <>

              New User?{' '}
              <span className="auth-link" style={{ cursor: 'pointer' }} onClick={switchToRegister}>
                Register Here
              </span>
            </>
          ) : (
            <>
              Already have access?{' '}
              <span className="auth-link" style={{ cursor: 'pointer' }} onClick={switchToLogin}>
                Login Here
              </span>
            </>
          )}
        </p>
      </div>
    </div>
  );
};

export default AuthGateway;