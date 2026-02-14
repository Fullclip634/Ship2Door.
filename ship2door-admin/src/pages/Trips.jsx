import React from 'react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { tripAPI } from '../services/api';
import { Plus, Ship, X, Search } from 'lucide-react';

const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '-';
const formatInput = (d) => d ? new Date(d).toISOString().split('T')[0] : '';

export default function Trips() {
    const navigate = useNavigate();
    const [trips, setTrips] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [filter, setFilter] = useState('');
    const [form, setForm] = useState({
        direction: 'manila_to_bohol', departure_date: '', estimated_arrival: '', booking_cutoff: '', notes: ''
    });
    const [saving, setSaving] = useState(false);

    useEffect(() => { loadTrips(); }, [filter]);

    const loadTrips = async () => {
        try {
            const params = {};
            if (filter) params.status = filter;
            const res = await tripAPI.getAll(params);
            setTrips(res.data.data);
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            await tripAPI.create(form);
            setShowModal(false);
            setForm({ direction: 'manila_to_bohol', departure_date: '', estimated_arrival: '', booking_cutoff: '', notes: '' });
            loadTrips();
        } catch (err) { alert(err.response?.data?.message || 'Error creating trip'); }
        finally { setSaving(false); }
    };

    const directionLabel = (d) => d === 'manila_to_bohol' ? 'Manila → Bohol' : 'Bohol → Manila';

    const statuses = ['', 'scheduled', 'picking_up', 'departed', 'in_transit', 'delayed', 'arrived', 'delivering', 'completed'];

    return (
        <div className="page-content">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-6)', flexWrap: 'wrap', gap: 'var(--space-3)' }}>
                <div>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 700, letterSpacing: '-0.03em' }}>Trip Management</h2>
                    <p style={{ fontSize: '0.875rem', color: 'var(--gray-500)', marginTop: '4px' }}>Manage your Manila → Bohol cargo trips</p>
                </div>
                <button className="btn btn-primary" onClick={() => setShowModal(true)}>
                    <Plus size={18} /> New Trip
                </button>
            </div>

            <div className="card" style={{ marginBottom: 'var(--space-6)' }}>
                <div style={{ padding: 'var(--space-4) var(--space-6)', display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
                    {statuses.map(s => (
                        <button key={s} className={`btn btn-sm ${filter === s ? 'btn-primary' : 'btn-secondary'}`}
                            onClick={() => setFilter(s)} style={{ textTransform: 'capitalize' }}>
                            {s ? s.replace(/_/g, ' ') : 'All'}
                        </button>
                    ))}
                </div>
            </div>

            <div className="card">
                {loading ? (
                    <div className="empty-state"><p>Loading...</p></div>
                ) : trips.length === 0 ? (
                    <div className="empty-state">
                        <Ship />
                        <h4>No trips found</h4>
                        <p>Create a new trip to get started.</p>
                    </div>
                ) : (
                    <div className="table-wrapper">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>Direction</th>
                                    <th>Departure</th>
                                    <th>Est. Arrival</th>
                                    <th>Cutoff</th>
                                    <th>Status</th>
                                    <th>Bookings</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {trips.map(trip => (
                                    <tr key={trip.id} style={{ cursor: 'pointer' }} onClick={() => navigate(`/trips/${trip.id}`)}>
                                        <td><span className={`direction-badge ${trip.direction}`}>{directionLabel(trip.direction)}</span></td>
                                        <td style={{ fontWeight: 500 }}>{formatDate(trip.departure_date)}</td>
                                        <td>{formatDate(trip.estimated_arrival)}</td>
                                        <td>{formatDate(trip.booking_cutoff)}</td>
                                        <td><span className={`status-badge ${trip.status}`}>{trip.status.replace(/_/g, ' ')}</span></td>
                                        <td><span style={{ fontWeight: 600, color: 'var(--navy-600)' }}>{trip.booking_count}</span></td>
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

            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>Create New Trip</h3>
                            <button className="modal-close" onClick={() => setShowModal(false)}><X size={18} /></button>
                        </div>
                        <form onSubmit={handleCreate}>
                            <div className="modal-body">
                                <div className="form-group">
                                    <label className="form-label">Direction</label>
                                    <select className="form-select" value={form.direction} onChange={e => setForm({ ...form, direction: e.target.value })}>
                                        <option value="manila_to_bohol">Manila → Bohol</option>
                                        <option value="bohol_to_manila">Bohol → Manila</option>
                                    </select>
                                </div>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label className="form-label">Departure Date</label>
                                        <input type="date" className="form-input" value={form.departure_date} onChange={e => setForm({ ...form, departure_date: e.target.value })} required />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Estimated Arrival</label>
                                        <input type="date" className="form-input" value={form.estimated_arrival} onChange={e => setForm({ ...form, estimated_arrival: e.target.value })} />
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Booking Cutoff Date</label>
                                    <input type="date" className="form-input" value={form.booking_cutoff} onChange={e => setForm({ ...form, booking_cutoff: e.target.value })} />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Notes</label>
                                    <textarea className="form-textarea" placeholder="Any additional notes about this trip..." value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} />
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                                <button type="submit" className="btn btn-primary" disabled={saving}>
                                    {saving ? 'Creating...' : 'Create Trip'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
