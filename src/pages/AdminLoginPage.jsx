// ==========================================================================
// SHARP CRACKERS - ADMIN LOGIN PAGE
// Secure administrative gateway with authentication state management
// ==========================================================================

import React, { useState } from 'react';
import { dataService } from '../services/dataService';
import { 
  Lock, 
  User, 
  Eye, 
  EyeOff, 
  ShieldCheck, 
  ArrowLeft, 
  Flame,
  AlertCircle
} from 'lucide-react';

export const AdminLoginPage = ({ setCurrentPage, onLoginSuccess }) => {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('sharp2026!');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = (e) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    setTimeout(() => {
      const res = dataService.adminLogin(username.trim(), password.trim());
      if (res.success) {
        if (onLoginSuccess) onLoginSuccess();
        setCurrentPage('admin-dashboard');
      } else {
        setErrorMsg(res.message);
      }
      setLoading(false);
    }, 400);
  };

  return (
    <div className="admin-login-wrapper">
      <div className="container login-container">
        <button onClick={() => setCurrentPage('home')} className="back-to-store-btn">
          <ArrowLeft size={16} /> Return to Customer Website
        </button>

        <div className="login-card card">
          <div className="login-header">
            <div className="login-logo-box">
              <Flame size={28} color="#ffb703" />
            </div>
            <h1 className="login-title">SHARP CRACKERS</h1>
            <p className="login-sub">Authorized Store Owner & Dispatch Portal</p>
          </div>

          {errorMsg && (
            <div className="login-error-alert">
              <AlertCircle size={18} />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="login-form">
            <div className="form-group">
              <label className="form-label">Username / Admin ID</label>
              <div className="input-with-icon">
                <User size={18} className="field-icon" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="admin"
                  required
                  className="login-input"
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <div className="input-with-icon">
                <Lock size={18} className="field-icon" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="login-input"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="toggle-pw-btn"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="login-hint-strip">
              <span className="hint-label">Default Demo Credentials:</span>
              <span className="hint-val">Username: <strong>admin</strong> | Password: <strong>sharp2026!</strong></span>
            </div>

            <button type="submit" className="btn btn-primary btn-block login-btn" disabled={loading}>
              <ShieldCheck size={18} />
              <span>{loading ? 'Authenticating...' : 'Sign In to Dashboard'}</span>
            </button>
          </form>

          <div className="login-security-notice">
            <Lock size={14} />
            <span>Encrypted Session • Sivakasi Factory Admin Unit</span>
          </div>
        </div>
      </div>

      <style>{`
        .admin-login-wrapper {
          min-height: 85vh;
          display: flex;
          align-items: center;
          padding: 4rem 0;
          background: linear-gradient(135deg, #050a18 0%, #0a1329 100%);
          color: #ffffff;
        }

        .login-container {
          max-width: 480px;
        }

        .back-to-store-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          color: #ffd166;
          font-weight: 600;
          font-size: 0.9rem;
          margin-bottom: 1.5rem;
          cursor: pointer;
        }
        .back-to-store-btn:hover {
          color: #ffffff;
        }

        .login-card {
          background: #ffffff;
          color: #0f172a;
          padding: 3rem 2.25rem;
          border-radius: var(--radius-xl);
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.45);
          border-top: 4px solid #ff6f00;
        }

        .login-header {
          text-align: center;
          margin-bottom: 2rem;
        }

        .login-logo-box {
          width: 56px;
          height: 56px;
          border-radius: 14px;
          background: #0a1329;
          border: 2px solid #ffb703;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 1rem;
          box-shadow: 0 4px 15px rgba(255, 183, 3, 0.3);
        }

        .login-title {
          font-size: 1.75rem;
          font-weight: 900;
          color: #0f172a;
          letter-spacing: 0.5px;
        }

        .login-sub {
          font-size: 0.85rem;
          color: #64748b;
          margin-top: 0.25rem;
        }

        .login-error-alert {
          background: #fef2f2;
          border: 1px solid #fecaca;
          color: #b91c1c;
          padding: 0.75rem 1rem;
          border-radius: var(--radius-md);
          font-size: 0.85rem;
          display: flex;
          align-items: center;
          gap: 0.65rem;
          margin-bottom: 1.5rem;
        }

        .login-form {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }

        .input-with-icon {
          position: relative;
        }

        .field-icon {
          position: absolute;
          left: 12px;
          top: 50%;
          transform: translateY(-50%);
          color: #94a3b8;
        }

        .login-input {
          width: 100%;
          padding: 0.75rem 2.5rem 0.75rem 2.5rem;
          border: 1.5px solid #cbd5e1;
          border-radius: var(--radius-md);
          font-size: 0.95rem;
          color: #0f172a;
          transition: all 0.2s ease;
        }

        .login-input:focus {
          border-color: #ff6f00;
          box-shadow: 0 0 0 3px rgba(255, 111, 0, 0.15);
        }

        .toggle-pw-btn {
          position: absolute;
          right: 12px;
          top: 50%;
          transform: translateY(-50%);
          color: #94a3b8;
          padding: 2px;
        }
        .toggle-pw-btn:hover {
          color: #ff6f00;
        }

        .login-hint-strip {
          background: #fffbeb;
          border: 1px solid #fde68a;
          padding: 0.6rem 0.85rem;
          border-radius: var(--radius-sm);
          font-size: 0.78rem;
          color: #92400e;
          display: flex;
          flex-direction: column;
          gap: 0.2rem;
        }

        .login-btn {
          padding: 0.85rem;
          font-size: 1rem;
          margin-top: 0.5rem;
        }

        .login-security-notice {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.4rem;
          font-size: 0.75rem;
          color: #94a3b8;
          margin-top: 1.75rem;
        }
      `}</style>
    </div>
  );
};
