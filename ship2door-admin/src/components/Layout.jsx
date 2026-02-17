import React, { useState, useEffect, useCallback } from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { notificationAPI } from '../services/api';
import {
    LayoutDashboard, Ship, Package, Bell, Megaphone,
    Users, Settings, LogOut, Menu, X
} from 'lucide-react';

const navItems = [
    { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/trips', icon: Ship, label: 'Trip Management' },
    { to: '/bookings', icon: Package, label: 'Bookings' },
    { to: '/announcements', icon: Megaphone, label: 'Announcements' },
    { to: '/customers', icon: Users, label: 'Customers' },
    { to: '/notifications', icon: Bell, label: 'Notifications' },
];

const pageTitles = {
    '/': 'Dashboard',
    '/trips': 'Trip Management',
    '/bookings': 'Bookings',
    '/announcements': 'Announcements',
    '/customers': 'Customers',
    '/notifications': 'Notifications',
    '/settings': 'Settings',
};

export default function Layout() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);

    // Fetch unread notification count
    const fetchUnreadCount = useCallback(async () => {
        try {
            const res = await notificationAPI.getUnreadCount();
            setUnreadCount(res.data.count || 0);
        } catch (err) {
            console.error('Failed to fetch unread count:', err);
        }
    }, []);

    useEffect(() => {
        fetchUnreadCount();
        // Poll every 30 seconds
        const interval = setInterval(fetchUnreadCount, 30000);
        return () => clearInterval(interval);
    }, [fetchUnreadCount]);

    // Refresh count when navigating away from notifications
    useEffect(() => {
        if (location.pathname === '/notifications') {
            // Small delay to let the page mark notifications as read
            const timeout = setTimeout(fetchUnreadCount, 1000);
            return () => clearTimeout(timeout);
        }
    }, [location.pathname, fetchUnreadCount]);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const initials = user?.name?.split(' ').map(n => n[0]).join('').slice(0, 2) || 'AD';

    const pageTitle = pageTitles[location.pathname] || '';

    return (
        <div className="app-layout">
            <div className={`sidebar-overlay ${sidebarOpen ? 'open' : ''}`} onClick={() => setSidebarOpen(false)} />

            <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
                <div className="sidebar-header" style={{ padding: '1.25rem' }}>
                    <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <img src="/logo.png" alt="Ship2Door Logo" style={{ width: '100%', height: 'auto', maxHeight: '44px', objectFit: 'contain' }} />
                    </div>
                </div>

                <nav className="sidebar-nav">
                    <div className="nav-label">Main Menu</div>
                    {navItems.map(item => (
                        <NavLink
                            key={item.to}
                            to={item.to}
                            end={item.to === '/'}
                            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                            onClick={() => setSidebarOpen(false)}
                        >
                            <item.icon />
                            <span>{item.label}</span>
                            {item.to === '/notifications' && unreadCount > 0 && (
                                <span className="nav-badge">{unreadCount > 99 ? '99+' : unreadCount}</span>
                            )}
                        </NavLink>
                    ))}

                    <div className="nav-label" style={{ marginTop: '0.5rem' }}>Account</div>
                    <NavLink
                        to="/settings"
                        className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                        onClick={() => setSidebarOpen(false)}
                    >
                        <Settings />
                        <span>Settings</span>
                    </NavLink>
                    <button className="nav-item" onClick={handleLogout}>
                        <LogOut />
                        <span>Sign Out</span>
                    </button>
                </nav>
            </aside>

            <div className="main-content">
                <header className="header">
                    <div className="header-left">
                        <button className="header-icon-btn menu-btn" onClick={() => setSidebarOpen(!sidebarOpen)}>
                            {sidebarOpen ? <X /> : <Menu />}
                        </button>
                        {pageTitle && <h2>{pageTitle}</h2>}
                    </div>
                    <div className="header-right">
                        <button className="header-icon-btn" onClick={() => navigate('/notifications')}>
                            <Bell />
                            {unreadCount > 0 && (
                                <span className="notification-badge">
                                    {unreadCount > 9 ? '9+' : unreadCount}
                                </span>
                            )}
                        </button>
                        <div className="header-avatar">{initials}</div>
                    </div>
                </header>
                <Outlet />
            </div>
        </div>
    );
}
