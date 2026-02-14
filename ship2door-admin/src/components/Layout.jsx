import React from 'react';
import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    LayoutDashboard, Ship, Package, Bell, Megaphone,
    Users, Settings, LogOut, Menu, X, ChevronRight
} from 'lucide-react';

const navItems = [
    { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/trips', icon: Ship, label: 'Trip Management' },
    { to: '/bookings', icon: Package, label: 'Bookings' },
    { to: '/announcements', icon: Megaphone, label: 'Announcements' },
    { to: '/customers', icon: Users, label: 'Customers' },
    { to: '/notifications', icon: Bell, label: 'Notifications' },
];

export default function Layout() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const initials = user?.name?.split(' ').map(n => n[0]).join('').slice(0, 2) || 'AD';

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
                    </div>
                    <div className="header-right">
                        <button className="header-icon-btn" onClick={() => navigate('/notifications')}>
                            <Bell />
                        </button>
                        <div className="header-avatar">{initials}</div>
                    </div>
                </header>
                <Outlet />
            </div>
        </div>
    );
}
