import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { tripAPI, bookingAPI } from '../services/api';
import {
    Ship, Package, Clock, Truck, Users, CheckCircle,
    ArrowRight, TrendingUp
} from 'lucide-react';

const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '-';

const timeAgo = (d) => {
    if (!d) return '';
    const now = new Date();
    const date = new Date(d);
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHrs = Math.floor(diffMins / 60);
    if (diffHrs < 24) return `${diffHrs}h ago`;
    const diffDays = Math.floor(diffHrs / 24);
    if (diffDays < 7) return `${diffDays}d ago`;
    return formatDate(d);
};

const getGreeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 18) return 'Good afternoon';
    return 'Good evening';
};

// Animated count-up hook
function useCountUp(target, duration = 800) {
    const [value, setValue] = useState(0);
    const ref = useRef(null);

    useEffect(() => {
        if (target === null || target === undefined) return;
        const end = Number(target);
        if (end === 0) { setValue(0); return; }

        const startTime = performance.now();
        const animate = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            // Ease out quad
            const eased = 1 - (1 - progress) * (1 - progress);
            setValue(Math.floor(eased * end));
            if (progress < 1) {
                ref.current = requestAnimationFrame(animate);
            }
        };
        ref.current = requestAnimationFrame(animate);
        return () => ref.current && cancelAnimationFrame(ref.current);
    }, [target, duration]);

    return value;
}

function AnimatedNumber({ value }) {
    const animated = useCountUp(value);
    return <>{animated}</>;
}

// Skeleton components
function StatCardSkeleton() {
    return (
        <div className="skeleton-stat-card">
            <div className="skeleton skeleton-icon" />
            <div className="skeleton-stat-content">
                <div className="skeleton skeleton-label" />
                <div className="skeleton skeleton-value" />
            </div>
        </div>
    );
}

function TableRowSkeleton() {
    return (
        <div className="skeleton-table-row">
            <div className="skeleton" style={{ width: '80%' }} />
            <div className="skeleton" style={{ width: '65%' }} />
            <div className="skeleton" style={{ width: '65%' }} />
            <div className="skeleton" style={{ width: '55%' }} />
            <div className="skeleton" style={{ width: '40%' }} />
            <div className="skeleton" style={{ width: '60%' }} />
        </div>
    );
}

export default function Dashboard() {
    const navigate = useNavigate();
    const [stats, setStats] = useState(null);
    const [activeTrips, setActiveTrips] = useState([]);
    const [recentBookings, setRecentBookings] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [statsRes, tripsRes, bookingsRes] = await Promise.all([
                tripAPI.getStats(),
                tripAPI.getActive(),
                bookingAPI.getAll({ limit: 5 }),
            ]);
            setStats(statsRes.data.data);
            setActiveTrips(tripsRes.data.data);
            setRecentBookings(bookingsRes.data.data || []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const directionLabel = (d) => d === 'manila_to_bohol' ? 'Manila  ▸  Bohol' : 'Bohol  ▸  Manila';

    return (
        <div className="page-content">
            <div style={{ marginBottom: 'var(--space-8)', display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
                <div style={{ backgroundColor: 'white', borderRadius: '14px', padding: '8px', width: '64px', height: '64px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'var(--shadow-card)' }}>
                    <img src="/logo.png" alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                </div>
                <div>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 700, letterSpacing: '-0.03em', color: 'var(--gray-900)' }}>{getGreeting()} 👋</h2>
                    <p style={{ fontSize: '0.875rem', color: 'var(--gray-500)', marginTop: '4px' }}>Here&apos;s your business overview for today.</p>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="stats-grid">
                {loading ? (
                    <>
                        {[...Array(6)].map((_, i) => <StatCardSkeleton key={i} />)}
                    </>
                ) : (
                    <>
                        <div className="stat-card">
                            <div className="stat-icon orange"><Ship size={22} /></div>
                            <div className="stat-content">
                                <h4>Active Trips</h4>
                                <div className="stat-value"><AnimatedNumber value={stats?.activeTrips || 0} /></div>
                            </div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-icon navy"><Package size={22} /></div>
                            <div className="stat-content">
                                <h4>Total Bookings</h4>
                                <div className="stat-value"><AnimatedNumber value={stats?.totalBookings || 0} /></div>
                            </div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-icon warning"><Clock size={22} /></div>
                            <div className="stat-content">
                                <h4>Pending Pickups</h4>
                                <div className="stat-value"><AnimatedNumber value={stats?.pendingPickups || 0} /></div>
                            </div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-icon info"><Truck size={22} /></div>
                            <div className="stat-content">
                                <h4>In Transit</h4>
                                <div className="stat-value"><AnimatedNumber value={stats?.inTransit || 0} /></div>
                            </div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-icon success"><CheckCircle size={22} /></div>
                            <div className="stat-content">
                                <h4>Delivered</h4>
                                <div className="stat-value"><AnimatedNumber value={stats?.delivered || 0} /></div>
                            </div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-icon navy"><Users size={22} /></div>
                            <div className="stat-content">
                                <h4>Customers</h4>
                                <div className="stat-value"><AnimatedNumber value={stats?.totalCustomers || 0} /></div>
                            </div>
                        </div>
                    </>
                )}
            </div>

            {/* Active Trips */}
            <div className="card">
                <div className="card-header">
                    <h3>Active Trips</h3>
                    <button className="btn btn-sm btn-secondary" onClick={() => navigate('/trips')}>
                        View All <ArrowRight size={14} />
                    </button>
                </div>
                {loading ? (
                    <div>
                        {[...Array(3)].map((_, i) => <TableRowSkeleton key={i} />)}
                    </div>
                ) : activeTrips.length === 0 ? (
                    <div className="empty-state">
                        <Ship />
                        <h4>No active trips</h4>
                        <p>Create a new trip to start receiving bookings.</p>
                    </div>
                ) : (
                    <div className="table-wrapper">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>Direction</th>
                                    <th>Departure</th>
                                    <th>Est. Arrival</th>
                                    <th>Status</th>
                                    <th>Bookings</th>
                                    <th></th>
                                </tr>
                            </thead>
                            <tbody>
                                {activeTrips.map(trip => (
                                    <tr key={trip.id} style={{ cursor: 'pointer' }} onClick={() => navigate(`/trips/${trip.id}`)}>
                                        <td>
                                            <span className={`direction-badge ${trip.direction}`}>
                                                {directionLabel(trip.direction)}
                                            </span>
                                        </td>
                                        <td style={{ fontWeight: 500 }}>{formatDate(trip.departure_date)}</td>
                                        <td>{formatDate(trip.estimated_arrival)}</td>
                                        <td><span className={`status-badge ${trip.status}`}>{trip.status.replace(/_/g, ' ')}</span></td>
                                        <td>
                                            <span style={{ fontWeight: 600, color: 'var(--navy-600)' }}>{trip.booking_count}</span>
                                        </td>
                                        <td>
                                            <button className="btn btn-sm btn-secondary" onClick={(e) => { e.stopPropagation(); navigate(`/trips/${trip.id}`); }}>
                                                View
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Recent Bookings */}
            <div className="card" style={{ marginTop: 'var(--space-6)' }}>
                <div className="card-header">
                    <h3>Recent Bookings</h3>
                    <button className="btn btn-sm btn-secondary" onClick={() => navigate('/bookings')}>
                        View All <ArrowRight size={14} />
                    </button>
                </div>
                {loading ? (
                    <div>
                        {[...Array(3)].map((_, i) => <TableRowSkeleton key={i} />)}
                    </div>
                ) : recentBookings.length === 0 ? (
                    <div className="empty-state">
                        <Package />
                        <h4>No bookings yet</h4>
                        <p>Bookings will appear here once customers start booking.</p>
                    </div>
                ) : (
                    <div className="table-wrapper">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>Booking #</th>
                                    <th>Customer</th>
                                    <th>Route</th>
                                    <th>Status</th>
                                    <th>Created</th>
                                    <th></th>
                                </tr>
                            </thead>
                            <tbody>
                                {recentBookings.map(b => (
                                    <tr key={b.id} style={{ cursor: 'pointer' }} onClick={() => navigate(`/bookings/${b.id}`)}>
                                        <td>
                                            <span style={{ fontFamily: 'monospace', fontWeight: 700, color: 'var(--navy-700)', fontSize: '0.8125rem' }}>
                                                {b.booking_number}
                                            </span>
                                        </td>
                                        <td style={{ fontWeight: 500 }}>{b.sender_name}</td>
                                        <td>
                                            <span className={`direction-badge ${b.direction}`}>
                                                {directionLabel(b.direction)}
                                            </span>
                                        </td>
                                        <td><span className={`status-badge ${b.status}`}>{b.status.replace(/_/g, ' ')}</span></td>
                                        <td>
                                            <span style={{ color: 'var(--gray-500)', fontSize: '0.8125rem' }}>
                                                {timeAgo(b.created_at)}
                                            </span>
                                        </td>
                                        <td>
                                            <button className="btn btn-sm btn-secondary" onClick={(e) => { e.stopPropagation(); navigate(`/bookings/${b.id}`); }}>
                                                View
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
