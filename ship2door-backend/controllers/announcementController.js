const pool = require('../config/db');

// Create announcement (Admin)
exports.createAnnouncement = async (req, res) => {
    try {
        const { trip_id, title, message, type } = req.body;

        const [result] = await pool.query(
            'INSERT INTO announcements (trip_id, title, message, type, created_by) VALUES (?, ?, ?, ?, ?)',
            [trip_id || null, title, message, type || 'general', req.user.id]
        );

        // Notify all customers
        const [customers] = await pool.query("SELECT id FROM users WHERE role = 'customer' AND is_active = TRUE");
        for (const customer of customers) {
            await pool.query(
                'INSERT INTO notifications (user_id, trip_id, title, message, type) VALUES (?, ?, ?, ?, ?)',
                [customer.id, trip_id || null, title, message, 'announcement']
            );
        }

        const [announcement] = await pool.query('SELECT * FROM announcements WHERE id = ?', [result.insertId]);
        res.status(201).json({ success: true, message: 'Announcement posted.', data: announcement[0] });
    } catch (error) {
        console.error('Create announcement error:', error);
        res.status(500).json({ success: false, message: 'Server error.' });
    }
};

// Get announcements
exports.getAnnouncements = async (req, res) => {
    try {
        const { page = 1, limit = 20 } = req.query;
        const [announcements] = await pool.query(
            `SELECT a.*, u.name as created_by_name, t.direction, t.departure_date
       FROM announcements a
       LEFT JOIN users u ON a.created_by = u.id
       LEFT JOIN trips t ON a.trip_id = t.id
       ORDER BY a.created_at DESC LIMIT ? OFFSET ?`,
            [parseInt(limit), (parseInt(page) - 1) * parseInt(limit)]
        );

        res.json({ success: true, data: announcements });
    } catch (error) {
        console.error('Get announcements error:', error);
        res.status(500).json({ success: false, message: 'Server error.' });
    }
};

// Delete announcement (Admin)
exports.deleteAnnouncement = async (req, res) => {
    try {
        await pool.query('DELETE FROM announcements WHERE id = ?', [req.params.id]);
        res.json({ success: true, message: 'Announcement deleted.' });
    } catch (error) {
        console.error('Delete announcement error:', error);
        res.status(500).json({ success: false, message: 'Server error.' });
    }
};
