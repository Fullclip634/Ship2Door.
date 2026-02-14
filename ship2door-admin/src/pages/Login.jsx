import React from 'react';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Eye, EyeOff } from 'lucide-react';

export default function Login() {
    const { login } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await login(email, password);
        } catch (err) {
            setError(err.response?.data?.message || 'Invalid credentials. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-page">
            {/* Decorative background elements */}
            <div className="login-bg-shapes">
                <div className="login-bg-circle login-bg-circle-1" />
                <div className="login-bg-circle login-bg-circle-2" />
                <div className="login-bg-circle login-bg-circle-3" />
            </div>

            <div className="login-card">
                {/* Logo */}
                <div className="login-logo">
                    <div className="login-logo-container">
                        <img src="/logo.png" alt="Ship2Door" className="login-logo-img" />
                    </div>
                    <p className="login-subtitle">Admin Control Center</p>
                </div>

                {/* Error */}
                {error && (
                    <div className="login-error">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" />
                        </svg>
                        {error}
                    </div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit} className="login-form">
                    <div className="login-field">
                        <label>Email Address</label>
                        <input
                            type="email"
                            placeholder="admin@ship2door.com"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            required
                            autoComplete="email"
                        />
                    </div>

                    <div className="login-field">
                        <label>Password</label>
                        <div className="login-password-wrap">
                            <input
                                type={showPassword ? 'text' : 'password'}
                                placeholder="Enter your password"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                required
                                autoComplete="current-password"
                            />
                            <button
                                type="button"
                                className="login-password-toggle"
                                onClick={() => setShowPassword(!showPassword)}
                                tabIndex={-1}
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>

                    <button type="submit" className="login-submit" disabled={loading}>
                        {loading ? (
                            <span className="login-spinner" />
                        ) : 'Sign In'}
                    </button>
                </form>

                <div className="login-footer">
                    <span>Ship2Door &copy; {new Date().getFullYear()}</span>
                    <span className="login-footer-dot">·</span>
                    <span>Secure Admin Access</span>
                </div>
            </div>
        </div>
    );
}
