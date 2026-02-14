import React from 'react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { tripAPI } from '../services/api';
import {
    Ship, Package, Clock, Truck, Users, CheckCircle,
    ArrowRight, TrendingUp
} from 'lucide-react';

const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '-';

export default function Dashboard() {
    const navigate = useNavigate();
    const [stats, setStats] = useState(null);
    const [activeTrips, setActiveTrips] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [statsRes, tripsRes] = await Promise.all([
                tripAPI.getStats(),
                tripAPI.getActive()
            ]);
            setStats(statsRes.data.data);
            setActiveTrips(tripsRes.data.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const directionLabel = (d) => d === 'manila_to_bohol' ? 'Manila → Bohol' : 'Bohol → Manila';

    if (loading) {
        return (
            <div className="page-content">
                <div style={{ textAlign: 'center', padding: '4rem 0', color: 'var(--gray-400)' }}>Loading...</div>
            </div>
        );
    }

    return (
        <div className="page-content">
            <div style={{ marginBottom: 'var(--space-8)', display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
                <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '8px', width: '64px', height: '64px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'var(--shadow-sm)' }}>
                    <img src="/logo.png" alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                </div>
                <div>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 700, letterSpacing: '-0.03em', color: 'var(--navy-800)' }}>Dashboard</h2>
                    <p style={{ fontSize: '0.875rem', color: 'var(--gray-500)', marginTop: '4px' }}>Welcome back! Here&apos;s your business overview.</p>
                </div>
            </div>

            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-icon orange"><Ship size={22} /></div>
                    <div className="stat-content">
                        <h4>Active Trips</h4>
                        <div className="stat-value">{stats?.activeTrips || 0}</div>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon navy"><Package size={22} /></div>
                    <div className="stat-content">
                        <h4>Total Bookings</h4>
                        <div className="stat-value">{stats?.totalBookings || 0}</div>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon warning"><Clock size={22} /></div>
                    <div className="stat-content">
                        <h4>Pending Pickups</h4>
                        <div className="stat-value">{stats?.pendingPickups || 0}</div>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon info"><Truck size={22} /></div>
                    <div className="stat-content">
                        <h4>In Transit</h4>
                        <div className="stat-value">{stats?.inTransit || 0}</div>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon success"><CheckCircle size={22} /></div>
                    <div className="stat-content">
                        <h4>Delivered</h4>
                        <div className="stat-value">{stats?.delivered || 0}</div>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon navy"><Users size={22} /></div>
                    <div className="stat-content">
                        <h4>Customers</h4>
                        <div className="stat-value">{stats?.totalCustomers || 0}</div>
                    </div>
                </div>
            </div>

            <div className="card">
                <div className="card-header">
                    <h3>Active Trips</h3>
                    <button className="btn btn-sm btn-secondary" onClick={() => navigate('/trips')}>
                        View All <ArrowRight size={14} />
                    </button>
                </div>
                {activeTrips.length === 0 ? (
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
                                    <tr key={trip.id}>
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
                                            <button className="btn btn-sm btn-secondary" onClick={() => navigate(`/trips/${trip.id}`)}>
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
