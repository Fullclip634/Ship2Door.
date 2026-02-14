import React from 'react';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../services/api';
import { User, Lock, Save, Shield, ChevronRight } from 'lucide-react';

export default function SettingsPage() {
    const { user, updateUser } = useAuth();
    const [profile, setProfile] = useState({
        name: user?.name || '', phone: user?.phone || '',
        address_manila: user?.address_manila || '', address_bohol: user?.address_bohol || ''
    });
    const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState('');
    const [activeTab, setActiveTab] = useState('profile');

    const handleProfile = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const res = await authAPI.updateProfile(profile);
            updateUser(res.data.data);
            setMessage('Profile updated successfully!');
            setTimeout(() => setMessage(''), 3000);
        } catch (err) { alert(err.response?.data?.message || 'Error'); }
        finally { setSaving(false); }
    };

    const handlePassword = async (e) => {
        e.preventDefault();
        if (passwords.newPassword !== passwords.confirmPassword) {
            alert('Passwords do not match');
            return;
        }
        setSaving(true);
        try {
            await authAPI.changePassword({ currentPassword: passwords.currentPassword, newPassword: passwords.newPassword });
            setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
            setMessage('Password changed successfully!');
            setTimeout(() => setMessage(''), 3000);
        } catch (err) { alert(err.response?.data?.message || 'Error'); }
        finally { setSaving(false); }
    };

    const initials = user?.name?.split(' ').map(n => n[0]).join('').slice(0, 2) || 'AD';

    return (
        <div className="page-content">
            {/* Profile Banner */}
            <div className="settings-banner">
                <div className="settings-banner-bg" />
                <div className="settings-banner-content">
                    <div className="settings-avatar">
                        <span>{initials}</span>
                    </div>
                    <div className="settings-user-info">
                        <h2>{user?.name || 'Admin'}</h2>
                        <p>{user?.email || 'admin@ship2door.com'}</p>
                    </div>
                </div>
            </div>

            {/* Success Message */}
            {message && (
                <div className="settings-toast">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20 6 9 17l-5-5" />
                    </svg>
                    {message}
                </div>
            )}

            {/* Tab Switcher */}
            <div className="settings-tabs">
                <button
                    className={`settings-tab ${activeTab === 'profile' ? 'active' : ''}`}
                    onClick={() => setActiveTab('profile')}
                >
                    <User size={16} />
                    <span>Profile</span>
                </button>
                <button
                    className={`settings-tab ${activeTab === 'security' ? 'active' : ''}`}
                    onClick={() => setActiveTab('security')}
                >
                    <Shield size={16} />
                    <span>Security</span>
                </button>
            </div>

            {/* Profile Tab */}
            {activeTab === 'profile' && (
                <div className="settings-section">
                    <div className="card">
                        <div className="card-header">
                            <h3>Personal Information</h3>
                        </div>
                        <div className="card-body">
                            <form onSubmit={handleProfile}>
                                <div className="settings-form-grid">
                                    <div className="form-group">
                                        <label className="form-label">Full Name</label>
                                        <input className="form-input" value={profile.name} onChange={e => setProfile({ ...profile, name: e.target.value })} required placeholder="Your full name" />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Phone Number</label>
                                        <input className="form-input" value={profile.phone} onChange={e => setProfile({ ...profile, phone: e.target.value })} placeholder="+63 9XX XXX XXXX" />
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Manila Address</label>
                                    <textarea className="form-textarea" value={profile.address_manila} onChange={e => setProfile({ ...profile, address_manila: e.target.value })} placeholder="Complete Manila address..." style={{ minHeight: '80px' }} />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Bohol Address</label>
                                    <textarea className="form-textarea" value={profile.address_bohol} onChange={e => setProfile({ ...profile, address_bohol: e.target.value })} placeholder="Complete Bohol address..." style={{ minHeight: '80px' }} />
                                </div>
                                <div className="settings-form-actions">
                                    <button type="submit" className="btn btn-primary" disabled={saving}>
                                        <Save size={16} /> {saving ? 'Saving...' : 'Save Changes'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* Security Tab */}
            {activeTab === 'security' && (
                <div className="settings-section">
                    <div className="card">
                        <div className="card-header">
                            <h3>Change Password</h3>
                        </div>
                        <div className="card-body">
                            <form onSubmit={handlePassword}>
                                <div className="form-group">
                                    <label className="form-label">Current Password</label>
                                    <input type="password" className="form-input" value={passwords.currentPassword} onChange={e => setPasswords({ ...passwords, currentPassword: e.target.value })} required placeholder="Enter current password" />
                                </div>
                                <div className="settings-form-grid">
                                    <div className="form-group">
                                        <label className="form-label">New Password</label>
                                        <input type="password" className="form-input" value={passwords.newPassword} onChange={e => setPasswords({ ...passwords, newPassword: e.target.value })} required placeholder="Min. 6 characters" />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Confirm New Password</label>
                                        <input type="password" className="form-input" value={passwords.confirmPassword} onChange={e => setPasswords({ ...passwords, confirmPassword: e.target.value })} required placeholder="Repeat new password" />
                                    </div>
                                </div>
                                <div className="settings-password-hint">
                                    <Lock size={14} />
                                    <span>Password must be at least 6 characters long. Use a mix of letters, numbers, and symbols for best security.</span>
                                </div>
                                <div className="settings-form-actions">
                                    <button type="submit" className="btn btn-navy" disabled={saving}>
                                        <Lock size={16} /> {saving ? 'Changing...' : 'Update Password'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
