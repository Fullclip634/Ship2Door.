import React from 'react';
import { useState, useEffect } from 'react';
import { authAPI } from '../services/api';
import { Users, Mail, Phone, MapPin } from 'lucide-react';

const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '-';

export default function Customers() {
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    useEffect(() => {
        authAPI.getCustomers().then(res => setCustomers(res.data.data)).catch(console.error).finally(() => setLoading(false));
    }, []);

    const filtered = customers.filter(c => !search ||
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.email.toLowerCase().includes(search.toLowerCase()) ||
        c.phone?.includes(search)
    );

    return (
        <div className="page-content">
            <div style={{ marginBottom: 'var(--space-6)' }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 700, letterSpacing: '-0.03em' }}>Customers</h2>
                <p style={{ fontSize: '0.875rem', color: 'var(--gray-500)', marginTop: '4px' }}>{customers.length} registered customers</p>
            </div>

            <div className="card" style={{ marginBottom: 'var(--space-6)' }}>
                <div style={{ padding: 'var(--space-4) var(--space-6)' }}>
                    <input className="form-input" placeholder="Search customers..." value={search} onChange={e => setSearch(e.target.value)} />
                </div>
            </div>

            <div className="card">
                {loading ? (
                    <div className="empty-state"><p>Loading...</p></div>
                ) : filtered.length === 0 ? (
                    <div className="empty-state">
                        <Users />
                        <h4>No customers found</h4>
                        <p>Customers will appear here when they register.</p>
                    </div>
                ) : (
                    <div className="table-wrapper">
                        <table className="table">
                            <thead>
                                <tr><th>Customer</th><th>Email</th><th>Phone</th><th>Manila Address</th><th>Bohol Address</th><th>Joined</th></tr>
                            </thead>
                            <tbody>
                                {filtered.map(c => (
                                    <tr key={c.id}>
                                        <td style={{ fontWeight: 500 }}>{c.name}</td>
                                        <td style={{ fontSize: '0.8125rem', color: 'var(--gray-500)' }}>{c.email}</td>
                                        <td>{c.phone || '-'}</td>
                                        <td style={{ fontSize: '0.8125rem', maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.address_manila || '-'}</td>
                                        <td style={{ fontSize: '0.8125rem', maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.address_bohol || '-'}</td>
                                        <td style={{ fontSize: '0.8125rem', color: 'var(--gray-500)' }}>{formatDate(c.created_at)}</td>
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
