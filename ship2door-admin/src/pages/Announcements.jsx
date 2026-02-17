import React, { useState, useEffect } from 'react';
import { announcementAPI, tripAPI } from '../services/api';
import { useToast } from '../components/Toast';
import ConfirmDialog from '../components/ConfirmDialog';
import { Megaphone, Plus, Trash2, X } from 'lucide-react';

const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '-';

function AnnouncementSkeleton() {
    return (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
            {[...Array(3)].map((_, i) => (
                <div key={i} style={{ padding: 'var(--space-5) var(--space-6)', borderBottom: '1px solid var(--gray-100)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 'var(--space-4)' }}>
                    <div style={{ flex: 1 }}>
                        <div className="skeleton" style={{ height: '16px', width: '40%', marginBottom: 'var(--space-3)' }} />
                        <div className="skeleton" style={{ height: '14px', width: '90%', marginBottom: 'var(--space-2)' }} />
                        <div className="skeleton" style={{ height: '14px', width: '70%', marginBottom: 'var(--space-3)' }} />
                        <div className="skeleton" style={{ height: '11px', width: '25%' }} />
                    </div>
                    <div className="skeleton" style={{ width: '36px', height: '36px', borderRadius: 'var(--radius-sm)', flexShrink: 0 }} />
                </div>
            ))}
        </div>
    );
}

export default function Announcements() {
    const toast = useToast();
    const [announcements, setAnnouncements] = useState([]);
    const [trips, setTrips] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [form, setForm] = useState({ trip_id: '', title: '', message: '', type: 'general' });
    const [saving, setSaving] = useState(false);
    const [deleteConfirm, setDeleteConfirm] = useState(null); // id to delete

    useEffect(() => {
        Promise.all([
            announcementAPI.getAll(),
            tripAPI.getActive()
        ]).then(([annRes, tripRes]) => {
            setAnnouncements(annRes.data.data);
            setTrips(tripRes.data.data);
        }).catch(console.error).finally(() => setLoading(false));
    }, []);

    const handleCreate = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            await announcementAPI.create({ ...form, trip_id: form.trip_id || null });
            setShowModal(false);
            setForm({ trip_id: '', title: '', message: '', type: 'general' });
            const res = await announcementAPI.getAll();
            setAnnouncements(res.data.data);
            toast.success('Announcement posted', 'Your announcement has been sent to all customers.');
        } catch (err) {
            toast.error('Failed to post', err.response?.data?.message || 'Something went wrong.');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id) => {
        try {
            await announcementAPI.delete(id);
            setAnnouncements(prev => prev.filter(a => a.id !== id));
            toast.success('Deleted', 'Announcement has been removed.');
        } catch (err) {
            toast.error('Error', 'Failed to delete announcement.');
        }
    };

    const directionLabel = (d) => d === 'manila_to_bohol' ? 'Manila  ▸  Bohol' : 'Bohol  ▸  Manila';

    return (
        <div className="page-content">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-6)', flexWrap: 'wrap', gap: 'var(--space-3)' }}>
                <div className="page-header" style={{ marginBottom: 0 }}>
                    <h2>Announcements</h2>
                    <p>Post updates to all customers</p>
                </div>
                <button className="btn btn-primary" onClick={() => setShowModal(true)}><Plus size={18} /> New Announcement</button>
            </div>

            <div className="card">
                {loading ? (
                    <AnnouncementSkeleton />
                ) : announcements.length === 0 ? (
                    <div className="empty-state">
                        <Megaphone />
                        <h4>No announcements</h4>
                        <p>Post an announcement to notify all customers.</p>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        {announcements.map(a => (
                            <div key={a.id} style={{ padding: 'var(--space-5) var(--space-6)', borderBottom: '1px solid var(--gray-100)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 'var(--space-4)' }}>
                                <div style={{ flex: 1 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-2)', flexWrap: 'wrap' }}>
                                        <h4 style={{ fontWeight: 600, fontSize: '0.9375rem' }}>{a.title}</h4>
                                        {a.direction && <span className={`direction-badge ${a.direction}`} style={{ fontSize: '0.6875rem' }}>{directionLabel(a.direction)}</span>}
                                    </div>
                                    <p style={{ fontSize: '0.875rem', color: 'var(--gray-600)', lineHeight: 1.6, marginBottom: 'var(--space-2)' }}>{a.message}</p>
                                    <span style={{ fontSize: '0.75rem', color: 'var(--gray-400)' }}>{formatDate(a.created_at)}</span>
                                </div>
                                <button className="btn btn-sm btn-danger" onClick={() => setDeleteConfirm(a.id)}><Trash2 size={14} /></button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Confirm Delete Dialog */}
            <ConfirmDialog
                open={deleteConfirm !== null}
                onClose={() => setDeleteConfirm(null)}
                onConfirm={() => handleDelete(deleteConfirm)}
                title="Delete Announcement"
                message="This announcement will be permanently removed. This action cannot be undone."
                confirmText="Delete"
                variant="danger"
            />

            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>Post Announcement</h3>
                            <button className="modal-close" onClick={() => setShowModal(false)}><X size={18} /></button>
                        </div>
                        <form onSubmit={handleCreate}>
                            <div className="modal-body">
                                <div className="form-group">
                                    <label className="form-label">Link to Trip (optional)</label>
                                    <select className="form-select" value={form.trip_id} onChange={e => setForm({ ...form, trip_id: e.target.value })}>
                                        <option value="">No specific trip</option>
                                        {trips.map(t => (
                                            <option key={t.id} value={t.id}>{directionLabel(t.direction)} — {new Date(t.departure_date).toLocaleDateString()}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Title</label>
                                    <input className="form-input" placeholder="Announcement title..." value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Message</label>
                                    <textarea className="form-textarea" placeholder="Write your announcement..." value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} required />
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                                <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Posting...' : 'Post Announcement'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
