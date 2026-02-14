import React from 'react';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../services/api';
import { User, Lock, Save } from 'lucide-react';

export default function SettingsPage() {
    const { user, updateUser } = useAuth();
    const [profile, setProfile] = useState({
        name: user?.name || '', phone: user?.phone || '',
        address_manila: user?.address_manila || '', address_bohol: user?.address_bohol || ''
    });
    const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState('');

    const handleProfile = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const res = await authAPI.updateProfile(profile);
            updateUser(res.data.data);
            setMessage('Profile updated!');
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
            setMessage('Password changed!');
            setTimeout(() => setMessage(''), 3000);
        } catch (err) { alert(err.response?.data?.message || 'Error'); }
        finally { setSaving(false); }
    };

    return (
        <div className="page-content">
            <div style={{ marginBottom: 'var(--space-6)' }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 700, letterSpacing: '-0.03em' }}>Settings</h2>
                <p style={{ fontSize: '0.875rem', color: 'var(--gray-500)', marginTop: '4px' }}>Manage your account</p>
            </div>

            {message && (
                <div style={{ padding: 'var(--space-3) var(--space-4)', background: 'var(--success-50)', color: 'var(--success-700)', borderRadius: 'var(--radius-md)', marginBottom: 'var(--space-6)', fontSize: '0.875rem', fontWeight: 500 }}>{message}</div>
            )}

            <div style={{ display: 'grid', gap: 'var(--space-6)', maxWidth: '640px' }}>
                <div className="card">
                    <div className="card-header"><h3><User size={16} style={{ display: 'inline', verticalAlign: 'text-bottom', marginRight: '8px' }} />Profile</h3></div>
                    <div className="card-body">
                        <form onSubmit={handleProfile}>
                            <div className="form-group">
                                <label className="form-label">Name</label>
                                <input className="form-input" value={profile.name} onChange={e => setProfile({ ...profile, name: e.target.value })} required />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Phone</label>
                                <input className="form-input" value={profile.phone} onChange={e => setProfile({ ...profile, phone: e.target.value })} />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Manila Address</label>
                                <textarea className="form-textarea" value={profile.address_manila} onChange={e => setProfile({ ...profile, address_manila: e.target.value })} style={{ minHeight: '70px' }} />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Bohol Address</label>
                                <textarea className="form-textarea" value={profile.address_bohol} onChange={e => setProfile({ ...profile, address_bohol: e.target.value })} style={{ minHeight: '70px' }} />
                            </div>
                            <button type="submit" className="btn btn-primary" disabled={saving}><Save size={16} /> {saving ? 'Saving...' : 'Save Changes'}</button>
                        </form>
                    </div>
                </div>

                <div className="card">
                    <div className="card-header"><h3><Lock size={16} style={{ display: 'inline', verticalAlign: 'text-bottom', marginRight: '8px' }} />Change Password</h3></div>
                    <div className="card-body">
                        <form onSubmit={handlePassword}>
                            <div className="form-group">
                                <label className="form-label">Current Password</label>
                                <input type="password" className="form-input" value={passwords.currentPassword} onChange={e => setPasswords({ ...passwords, currentPassword: e.target.value })} required />
                            </div>
                            <div className="form-group">
                                <label className="form-label">New Password</label>
                                <input type="password" className="form-input" value={passwords.newPassword} onChange={e => setPasswords({ ...passwords, newPassword: e.target.value })} required />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Confirm New Password</label>
                                <input type="password" className="form-input" value={passwords.confirmPassword} onChange={e => setPasswords({ ...passwords, confirmPassword: e.target.value })} required />
                            </div>
                            <button type="submit" className="btn btn-navy" disabled={saving}><Lock size={16} /> {saving ? 'Changing...' : 'Change Password'}</button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
