import React from 'react';
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { bookingAPI } from '../services/api';
import { ArrowLeft, Package, MapPin, Phone, User, FileText, Calendar } from 'lucide-react';

const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '-';
const bookingStatuses = ['pending_pickup', 'picked_up', 'in_transit', 'arrived', 'out_for_delivery', 'delivered', 'cancelled'];

export default function BookingDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [booking, setBooking] = useState(null);
    const [loading, setLoading] = useState(true);
    const [pickupDate, setPickupDate] = useState('');
    const [pickupTime, setPickupTime] = useState('');

    useEffect(() => { loadBooking(); }, [id]);

    const loadBooking = async () => {
        try {
            const res = await bookingAPI.getOne(id);
            setBooking(res.data.data);
            if (res.data.data.pickup_date) setPickupDate(res.data.data.pickup_date.split('T')[0]);
            if (res.data.data.pickup_time_window) setPickupTime(res.data.data.pickup_time_window);
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    const handleStatus = async (status) => {
        try {
            await bookingAPI.updateStatus(id, { status });
            loadBooking();
        } catch (err) { alert(err.response?.data?.message || 'Error'); }
    };

    const handlePickup = async () => {
        try {
            await bookingAPI.updatePickup(id, { pickup_date: pickupDate, pickup_time_window: pickupTime });
            alert('Pickup scheduled! Customer will be notified.');
            loadBooking();
        } catch (err) { alert(err.response?.data?.message || 'Error'); }
    };

    if (loading) return <div className="page-content"><p style={{ textAlign: 'center', padding: '4rem', color: 'var(--gray-400)' }}>Loading...</p></div>;
    if (!booking) return <div className="page-content"><p>Booking not found.</p></div>;

    return (
        <div className="page-content">
            <button className="btn btn-secondary btn-sm" onClick={() => navigate(-1)} style={{ marginBottom: 'var(--space-6)' }}>
                <ArrowLeft size={16} /> Back
            </button>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-6)', flexWrap: 'wrap', gap: 'var(--space-3)' }}>
                <div>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 700, letterSpacing: '-0.03em', fontFamily: 'monospace' }}>{booking.booking_number}</h2>
                    <p style={{ fontSize: '0.875rem', color: 'var(--gray-500)', marginTop: '4px' }}>Booked on {formatDate(booking.created_at)}</p>
                </div>
                <span className={`status-badge ${booking.status}`} style={{ fontSize: '0.875rem', padding: '6px 14px' }}>{booking.status.replace(/_/g, ' ')}</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 'var(--space-6)' }}>
                {/* Sender Info */}
                <div className="card">
                    <div className="card-header"><h3>Sender</h3></div>
                    <div className="card-body">
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                                <User size={16} style={{ color: 'var(--gray-400)' }} />
                                <div><div style={{ fontSize: '0.75rem', color: 'var(--gray-500)' }}>Name</div><div style={{ fontWeight: 500 }}>{booking.sender_name}</div></div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                                <Phone size={16} style={{ color: 'var(--gray-400)' }} />
                                <div><div style={{ fontSize: '0.75rem', color: 'var(--gray-500)' }}>Phone</div><div style={{ fontWeight: 500 }}>{booking.sender_phone}</div></div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--space-3)' }}>
                                <MapPin size={16} style={{ color: 'var(--gray-400)', marginTop: '2px' }} />
                                <div><div style={{ fontSize: '0.75rem', color: 'var(--gray-500)' }}>Address</div><div style={{ fontWeight: 500 }}>{booking.sender_address}</div></div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Receiver Info */}
                <div className="card">
                    <div className="card-header"><h3>Receiver</h3></div>
                    <div className="card-body">
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                                <User size={16} style={{ color: 'var(--gray-400)' }} />
                                <div><div style={{ fontSize: '0.75rem', color: 'var(--gray-500)' }}>Name</div><div style={{ fontWeight: 500 }}>{booking.receiver_name}</div></div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                                <Phone size={16} style={{ color: 'var(--gray-400)' }} />
                                <div><div style={{ fontSize: '0.75rem', color: 'var(--gray-500)' }}>Phone</div><div style={{ fontWeight: 500 }}>{booking.receiver_phone}</div></div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--space-3)' }}>
                                <MapPin size={16} style={{ color: 'var(--gray-400)', marginTop: '2px' }} />
                                <div><div style={{ fontSize: '0.75rem', color: 'var(--gray-500)' }}>Address</div><div style={{ fontWeight: 500 }}>{booking.receiver_address}</div></div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Instructions */}
                {booking.special_instructions && (
                    <div className="card">
                        <div className="card-header"><h3>Special Instructions</h3></div>
                        <div className="card-body">
                            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--space-3)' }}>
                                <FileText size={16} style={{ color: 'var(--orange-500)', marginTop: '2px' }} />
                                <p style={{ fontSize: '0.875rem', color: 'var(--gray-700)', lineHeight: 1.7 }}>{booking.special_instructions}</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Items */}
                <div className="card">
                    <div className="card-header"><h3>Items ({booking.items?.length || 0})</h3></div>
                    <div className="card-body">
                        {booking.items && booking.items.length > 0 ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                                {booking.items.map((item, i) => (
                                    <div key={item.id} style={{ padding: 'var(--space-3) var(--space-4)', background: 'var(--gray-50)', borderRadius: 'var(--radius-md)' }}>
                                        <div style={{ fontWeight: 500, marginBottom: '4px' }}>{item.description}</div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--gray-500)', display: 'flex', gap: 'var(--space-4)', flexWrap: 'wrap' }}>
                                            <span>Qty: {item.quantity}</span>
                                            {item.size_estimate && <span>Size: {item.size_estimate}</span>}
                                            {item.weight_estimate && <span>Weight: {item.weight_estimate}kg</span>}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p style={{ fontSize: '0.875rem', color: 'var(--gray-500)' }}>No items listed.</p>
                        )}
                    </div>
                </div>

                {/* Actions */}
                <div className="card">
                    <div className="card-header"><h3>Actions</h3></div>
                    <div className="card-body">
                        <div className="form-group">
                            <label className="form-label">Update Status</label>
                            <select className="form-select" value={booking.status} onChange={e => handleStatus(e.target.value)}>
                                {bookingStatuses.map(s => (
                                    <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>
                                ))}
                            </select>
                        </div>
                        <div className="form-group">
                            <label className="form-label">Schedule Pickup</label>
                            <div className="form-row">
                                <input type="date" className="form-input" value={pickupDate} onChange={e => setPickupDate(e.target.value)} />
                                <input type="text" className="form-input" placeholder="e.g. 9AM - 12PM" value={pickupTime} onChange={e => setPickupTime(e.target.value)} />
                            </div>
                        </div>
                        <button className="btn btn-primary" onClick={handlePickup} disabled={!pickupDate} style={{ width: '100%' }}>
                            <Calendar size={16} /> Schedule Pickup
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
