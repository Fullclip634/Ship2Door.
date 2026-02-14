import React from 'react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { bookingAPI } from '../services/api';
import { Package, Search } from 'lucide-react';

const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '-';

export default function Bookings() {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => { loadBookings(); }, [filter, search]);

  const loadBookings = async () => {
    try {
      const params = {};
      if (filter) params.status = filter;
      if (search) params.search = search;
      const res = await bookingAPI.getAll(params);
      setBookings(res.data.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const directionLabel = (d) => d === 'manila_to_bohol' ? 'Manila → Bohol' : 'Bohol → Manila';
  const statuses = ['', 'pending_pickup', 'picked_up', 'in_transit', 'arrived', 'out_for_delivery', 'delivered', 'cancelled'];

  return (
    <div className="page-content">
      <div style={{ marginBottom: 'var(--space-6)' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, letterSpacing: '-0.03em' }}>Bookings</h2>
        <p style={{ fontSize: '0.875rem', color: 'var(--gray-500)', marginTop: '4px' }}>All customer shipment bookings</p>
      </div>

      <div className="card" style={{ marginBottom: 'var(--space-6)' }}>
        <div style={{ padding: 'var(--space-4) var(--space-6)', display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
          <div style={{ position: 'relative' }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--gray-400)' }} />
            <input className="form-input" placeholder="Search by booking #, name..." value={search} onChange={e => setSearch(e.target.value)} style={{ paddingLeft: '36px' }} />
          </div>
          <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
            {statuses.map(s => (
              <button key={s} className={`btn btn-sm ${filter === s ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setFilter(s)} style={{ textTransform: 'capitalize' }}>
                {s ? s.replace(/_/g, ' ') : 'All'}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="card">
        {loading ? (
          <div className="empty-state"><p>Loading...</p></div>
        ) : bookings.length === 0 ? (
          <div className="empty-state">
            <Package />
            <h4>No bookings found</h4>
            <p>Bookings will appear here when customers book shipments.</p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table className="table">
              <thead>
                <tr>
                  <th>Booking #</th>
                  <th>Customer</th>
                  <th>Direction</th>
                  <th>Sender</th>
                  <th>Receiver</th>
                  <th>Status</th>
                  <th>Booked</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {bookings.map(b => (
                  <tr key={b.id} style={{ cursor: 'pointer' }} onClick={() => navigate(`/bookings/${b.id}`)}>
                    <td style={{ fontWeight: 600, fontFamily: 'monospace', color: 'var(--navy-600)' }}>{b.booking_number}</td>
                    <td>
                      <div style={{ fontWeight: 500 }}>{b.customer_name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--gray-500)' }}>{b.customer_phone}</div>
                    </td>
                    <td><span className={`direction-badge ${b.direction}`} style={{ fontSize: '0.6875rem' }}>{directionLabel(b.direction)}</span></td>
                    <td>{b.sender_name}</td>
                    <td>{b.receiver_name}</td>
                    <td><span className={`status-badge ${b.status}`}>{b.status.replace(/_/g, ' ')}</span></td>
                    <td style={{ fontSize: '0.8125rem', color: 'var(--gray-500)' }}>{formatDate(b.created_at)}</td>
                    <td><button className="btn btn-sm btn-secondary" onClick={e => { e.stopPropagation(); navigate(`/bookings/${b.id}`); }}>View</button></td>
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
