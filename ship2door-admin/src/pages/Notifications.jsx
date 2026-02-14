import React from 'react';
import { useState, useEffect } from 'react';
import { notificationAPI } from '../services/api';
import { Bell, CheckCheck } from 'lucide-react';

const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '-';

const typeIcons = {
    status_update: { color: 'var(--info-500)', bg: 'var(--info-50)' },
    pickup_reminder: { color: 'var(--warning-500)', bg: 'var(--warning-50)' },
    announcement: { color: 'var(--orange-500)', bg: 'var(--orange-50)' },
    delay: { color: 'var(--danger-500)', bg: 'var(--danger-50)' },
    delivery: { color: 'var(--success-500)', bg: 'var(--success-50)' },
};

export default function Notifications() {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [unreadCount, setUnreadCount] = useState(0);

    useEffect(() => { loadNotifications(); }, []);

    const loadNotifications = async () => {
        try {
            const res = await notificationAPI.getAll();
            setNotifications(res.data.data);
            setUnreadCount(res.data.unreadCount);
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    const markRead = async (id) => {
        try {
            await notificationAPI.markAsRead(id);
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (err) { console.error(err); }
    };

    const markAllRead = async () => {
        try {
            await notificationAPI.markAllAsRead();
            setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
            setUnreadCount(0);
        } catch (err) { console.error(err); }
    };

    return (
        <div className="page-content">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-6)', flexWrap: 'wrap', gap: 'var(--space-3)' }}>
                <div className="page-header" style={{ marginBottom: 0 }}>
                    <h2>Notifications</h2>
                    <p>{unreadCount} unread notifications</p>
                </div>
                {unreadCount > 0 && (
                    <button className="btn btn-secondary" onClick={markAllRead}><CheckCheck size={16} /> Mark All Read</button>
                )}
            </div>

            <div className="card">
                {loading ? (
                    <div className="empty-state"><p>Loading...</p></div>
                ) : notifications.length === 0 ? (
                    <div className="empty-state">
                        <Bell />
                        <h4>No notifications</h4>
                        <p>You&apos;re all caught up!</p>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        {notifications.map(n => {
                            const style = typeIcons[n.type] || typeIcons.status_update;
                            return (
                                <div key={n.id} style={{
                                    padding: 'var(--space-4) var(--space-6)', borderBottom: '1px solid var(--gray-100)',
                                    display: 'flex', alignItems: 'flex-start', gap: 'var(--space-4)',
                                    background: n.is_read ? 'white' : 'var(--gray-25)', cursor: n.is_read ? 'default' : 'pointer',
                                    transition: 'background 0.15s ease'
                                }} onClick={() => !n.is_read && markRead(n.id)}>
                                    <div style={{ width: '40px', height: '40px', borderRadius: 'var(--radius-md)', background: style.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                        <Bell size={16} style={{ color: style.color }} />
                                    </div>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                                            <h4 style={{ fontWeight: n.is_read ? 500 : 600, fontSize: '0.875rem' }}>{n.title}</h4>
                                            {!n.is_read && <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: 'var(--orange-500)', flexShrink: 0 }} />}
                                        </div>
                                        <p style={{ fontSize: '0.8125rem', color: 'var(--gray-600)', lineHeight: 1.5, marginTop: '2px' }}>{n.message}</p>
                                        <span style={{ fontSize: '0.75rem', color: 'var(--gray-400)' }}>{formatDate(n.created_at)}</span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
