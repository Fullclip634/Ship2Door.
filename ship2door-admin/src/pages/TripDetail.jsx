import React from 'react';
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { tripAPI, bookingAPI, announcementAPI } from '../services/api';
import {
    ArrowLeft, Ship, Package, Clock, CheckCircle, AlertTriangle,
    Truck, MapPin, X, Megaphone, Calendar
} from 'lucide-react';
import { useToast } from '../components/Toast';

const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '-';

const tripStatuses = ['scheduled', 'picking_up', 'departed', 'in_transit', 'delayed', 'arrived', 'delivering', 'completed'];
const bookingStatuses = ['pending_pickup', 'picked_up', 'in_transit', 'arrived', 'out_for_delivery', 'delivered', 'cancelled'];

export default function TripDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [trip, setTrip] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showStatusModal, setShowStatusModal] = useState(false);
    const [showBroadcast, setShowBroadcast] = useState(false);
    const [newStatus, setNewStatus] = useState('');
    const [delayReason, setDelayReason] = useState('');
    const [broadcast, setBroadcast] = useState({ title: '', message: '' });
    const [saving, setSaving] = useState(false);
    const toast = useToast();

    useEffect(() => { loadTrip(); }, [id]);

    const loadTrip = async () => {
        try {
            const res = await tripAPI.getOne(id);
            setTrip(res.data.data);
            setNewStatus(res.data.data.status);
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    const handleStatusUpdate = async () => {
        setSaving(true);
        try {
            await tripAPI.updateStatus(id, { status: newStatus, delay_reason: delayReason });
            setShowStatusModal(false);
            setDelayReason('');
            loadTrip();
            toast.success('Status updated', `Trip status changed to ${newStatus.replace(/_/g, ' ')}`);
        } catch (err) { toast.error('Error', err.response?.data?.message || 'Failed to update status'); }
        finally { setSaving(false); }
    };

    const handleBookingStatus = async (bookingId, status) => {
        try {
            await bookingAPI.updateStatus(bookingId, { status });
            loadTrip();
            toast.success('Booking updated', `Status changed to ${status.replace(/_/g, ' ')}`);
        } catch (err) { toast.error('Error', err.response?.data?.message || 'Failed to update booking'); }
    };

    const handleBroadcast = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            await announcementAPI.create({ trip_id: parseInt(id), ...broadcast, type: 'trip' });
            setShowBroadcast(false);
            setBroadcast({ title: '', message: '' });
            toast.success('Broadcast sent', 'All customers on this trip have been notified.');
        } catch (err) { toast.error('Error', err.response?.data?.message || 'Failed to send broadcast'); }
        finally { setSaving(false); }
    };

    const directionLabel = (d) => d === 'manila_to_bohol' ? 'Manila  ▸  Bohol' : 'Bohol  ▸  Manila';

    if (loading) return <div className="page-content"><p style={{ textAlign: 'center', padding: '4rem', color: 'var(--gray-400)' }}>Loading...</p></div>;
    if (!trip) return <div className="page-content"><p>Trip not found.</p></div>;

    const currentIdx = tripStatuses.indexOf(trip.status);

    return (
        <div className="page-content">
            <button className="btn btn-secondary btn-sm" onClick={() => navigate('/trips')} style={{ marginBottom: 'var(--space-6)' }}>
                <ArrowLeft size={16} /> Back to Trips
            </button>

            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 'var(--space-6)', flexWrap: 'wrap', gap: 'var(--space-3)' }}>
                <div>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 700, letterSpacing: '-0.03em', display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                        <span className={`direction-badge ${trip.direction}`} style={{ fontSize: '0.875rem' }}>{directionLabel(trip.direction)}</span>
                        Trip #{trip.id}
                    </h2>
                    <p style={{ fontSize: '0.875rem', color: 'var(--gray-500)', marginTop: '4px' }}>
                        Departure: {formatDate(trip.departure_date)} • Est. Arrival: {formatDate(trip.estimated_arrival)}
                    </p>
                </div>
                <div style={{ display: 'flex', gap: 'var(--space-3)', flexWrap: 'wrap' }}>
                    <button className="btn btn-secondary" onClick={() => setShowBroadcast(true)}><Megaphone size={18} /> Broadcast</button>
                    <button className="btn btn-primary" onClick={() => setShowStatusModal(true)}>Update Status</button>
                </div>
            </div>

            {/* Trip Progress */}
            <div className="card" style={{ marginBottom: 'var(--space-6)' }}>
                <div className="card-body">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', overflow: 'auto', gap: '0.25rem', paddingBottom: '0.5rem', position: 'relative' }}>
                        {/* Connecting line */}
                        <div style={{
                            position: 'absolute', top: '16px', left: '40px', right: '40px', height: '3px',
                            background: `linear-gradient(to right, var(--success-500) ${currentIdx / (tripStatuses.length - 1) * 100}%, var(--gray-200) ${currentIdx / (tripStatuses.length - 1) * 100}%)`,
                            borderRadius: '2px', zIndex: 0
                        }} />
                        {tripStatuses.map((s, i) => {
                            const isDone = i <= currentIdx;
                            const isCurrent = i === currentIdx;
                            return (
                                <div key={s} style={{ textAlign: 'center', flex: 1, minWidth: '80px', position: 'relative', zIndex: 1 }}>
                                    <div style={{
                                        width: '34px', height: '34px', borderRadius: '50%', margin: '0 auto 0.5rem',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        background: isCurrent ? 'var(--orange-500)' : isDone ? 'var(--success-500)' : 'white',
                                        border: isDone || isCurrent ? 'none' : '2px solid var(--gray-200)',
                                        color: isDone || isCurrent ? 'white' : 'var(--gray-400)', fontSize: '0.75rem', fontWeight: 600,
                                        boxShadow: isCurrent ? '0 0 0 4px rgba(245, 148, 30, 0.15)' : isDone ? '0 0 0 3px rgba(34, 197, 94, 0.1)' : 'none'
                                    }}>
                                        {isDone && !isCurrent ? <CheckCircle size={16} /> : i + 1}
                                    </div>
                                    <span style={{
                                        fontSize: '0.6875rem', fontWeight: isCurrent ? 700 : 500, textTransform: 'capitalize',
                                        color: isCurrent ? 'var(--orange-600)' : isDone ? 'var(--gray-700)' : 'var(--gray-400)'
                                    }}>{s.replace(/_/g, ' ')}</span>
                                </div>
                            );
                        })}
                    </div>
                    {trip.delay_reason && (
                        <div style={{ marginTop: 'var(--space-4)', padding: 'var(--space-3) var(--space-4)', background: 'var(--danger-50)', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                            <AlertTriangle size={16} style={{ color: 'var(--danger-500)', flexShrink: 0 }} />
                            <span style={{ fontSize: '0.8125rem', color: 'var(--danger-700)', fontWeight: 500 }}>Delay reason: {trip.delay_reason}</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Stats Row */}
            <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', marginBottom: 'var(--space-6)' }}>
                <div className="stat-card">
                    <div className="stat-icon navy"><Package size={20} /></div>
                    <div className="stat-content"><h4>Total Bookings</h4><div className="stat-value">{trip.booking_count}</div></div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon success"><CheckCircle size={20} /></div>
                    <div className="stat-content"><h4>Delivered</h4><div className="stat-value">{trip.delivered_count}</div></div>
                </div>
            </div>

            {/* Bookings Table */}
            <div className="card">
                <div className="card-header">
                    <h3>Bookings on this Trip</h3>
                </div>
                {!trip.bookings || trip.bookings.length === 0 ? (
                    <div className="empty-state">
                        <Package />
                        <h4>No bookings yet</h4>
                        <p>Customers haven&apos;t booked on this trip yet.</p>
                    </div>
                ) : (
                    <div className="table-wrapper">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>Booking #</th>
                                    <th>Customer</th>
                                    <th>Receiver</th>
                                    <th>Status</th>
                                    <th>Pickup Date</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {trip.bookings.map(b => (
                                    <tr key={b.id}>
                                        <td style={{ fontWeight: 600, fontFamily: 'monospace', color: 'var(--navy-600)' }}>{b.booking_number}</td>
                                        <td>
                                            <div style={{ fontWeight: 500 }}>{b.customer_name}</div>
                                            <div style={{ fontSize: '0.75rem', color: 'var(--gray-500)' }}>{b.customer_phone}</div>
                                        </td>
                                        <td>
                                            <div style={{ fontWeight: 500 }}>{b.receiver_name}</div>
                                            <div style={{ fontSize: '0.75rem', color: 'var(--gray-500)', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{b.receiver_address}</div>
                                        </td>
                                        <td><span className={`status-badge ${b.status}`}>{b.status.replace(/_/g, ' ')}</span></td>
                                        <td>{formatDate(b.pickup_date)}</td>
                                        <td>
                                            <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
                                                <button className="btn btn-sm btn-secondary" onClick={() => navigate(`/bookings/${b.id}`)}>View</button>
                                                <select
                                                    className="form-select"
                                                    style={{ height: '36px', fontSize: '0.75rem', width: 'auto', minWidth: '130px' }}
                                                    value={b.status}
                                                    onChange={(e) => handleBookingStatus(b.id, e.target.value)}
                                                >
                                                    {bookingStatuses.map(s => (
                                                        <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>
                                                    ))}
                                                </select>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Update Status Modal */}
            {showStatusModal && (
                <div className="modal-overlay" onClick={() => setShowStatusModal(false)}>
                    <div className="modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>Update Trip Status</h3>
                            <button className="modal-close" onClick={() => setShowStatusModal(false)}><X size={18} /></button>
                        </div>
                        <div className="modal-body">
                            <div className="form-group">
                                <label className="form-label">Status</label>
                                <select className="form-select" value={newStatus} onChange={e => setNewStatus(e.target.value)}>
                                    {tripStatuses.map(s => (
                                        <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>
                                    ))}
                                </select>
                            </div>
                            {newStatus === 'delayed' && (
                                <div className="form-group">
                                    <label className="form-label">Delay Reason</label>
                                    <textarea className="form-textarea" placeholder="e.g. High wave intensity at the port..." value={delayReason} onChange={e => setDelayReason(e.target.value)} />
                                </div>
                            )}
                            <p style={{ fontSize: '0.8125rem', color: 'var(--gray-500)', marginTop: 'var(--space-2)' }}>
                                All customers on this trip will be automatically notified.
                            </p>
                        </div>
                        <div className="modal-footer">
                            <button className="btn btn-secondary" onClick={() => setShowStatusModal(false)}>Cancel</button>
                            <button className="btn btn-primary" onClick={handleStatusUpdate} disabled={saving}>{saving ? 'Updating...' : 'Update Status'}</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Broadcast Modal */}
            {showBroadcast && (
                <div className="modal-overlay" onClick={() => setShowBroadcast(false)}>
                    <div className="modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>Broadcast to All Customers</h3>
                            <button className="modal-close" onClick={() => setShowBroadcast(false)}><X size={18} /></button>
                        </div>
                        <form onSubmit={handleBroadcast}>
                            <div className="modal-body">
                                <div className="form-group">
                                    <label className="form-label">Title</label>
                                    <input className="form-input" placeholder="e.g. Trip Delay Update" value={broadcast.title} onChange={e => setBroadcast({ ...broadcast, title: e.target.value })} required />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Message</label>
                                    <textarea className="form-textarea" placeholder="Write your announcement..." value={broadcast.message} onChange={e => setBroadcast({ ...broadcast, message: e.target.value })} required />
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={() => setShowBroadcast(false)}>Cancel</button>
                                <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Sending...' : 'Send Broadcast'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
