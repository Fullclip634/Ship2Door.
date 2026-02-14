const pool = require('../config/db');
const { sendToUser } = require('../services/notificationService');

// Create a new trip (Admin only)
exports.createTrip = async (req, res) => {
    try {
        const { direction, departure_date, estimated_arrival, booking_cutoff, notes } = req.body;

        const [result] = await pool.query(
            'INSERT INTO trips (direction, departure_date, estimated_arrival, booking_cutoff, notes, created_by) VALUES (?, ?, ?, ?, ?, ?)',
            [direction, departure_date, estimated_arrival || null, booking_cutoff || null, notes || null, req.user.id]
        );

        const [trip] = await pool.query('SELECT * FROM trips WHERE id = ?', [result.insertId]);

        res.status(201).json({ success: true, message: 'Trip created.', data: trip[0] });
    } catch (error) {
        console.error('Create trip error:', error);
        res.status(500).json({ success: false, message: 'Server error.' });
    }
};

// Get all trips (with optional filters)
exports.getTrips = async (req, res) => {
    try {
        const { status, direction, page = 1, limit = 20 } = req.query;
        let query = 'SELECT t.*, u.name as created_by_name, (SELECT COUNT(*) FROM bookings WHERE trip_id = t.id) as booking_count FROM trips t LEFT JOIN users u ON t.created_by = u.id';
        const params = [];
        const conditions = [];

        if (status) {
            conditions.push('t.status = ?');
            params.push(status);
        }
        if (direction) {
            conditions.push('t.direction = ?');
            params.push(direction);
        }

        if (conditions.length > 0) {
            query += ' WHERE ' + conditions.join(' AND ');
        }

        query += ' ORDER BY t.departure_date DESC';
        query += ` LIMIT ? OFFSET ?`;
        params.push(parseInt(limit), (parseInt(page) - 1) * parseInt(limit));

        const [trips] = await pool.query(query, params);

        // Get total count
        let countQuery = 'SELECT COUNT(*) as total FROM trips t';
        if (conditions.length > 0) {
            countQuery += ' WHERE ' + conditions.join(' AND ');
        }
        const [countResult] = await pool.query(countQuery, params.slice(0, -2));

        res.json({
            success: true,
            data: trips,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total: countResult[0].total,
                totalPages: Math.ceil(countResult[0].total / parseInt(limit))
            }
        });
    } catch (error) {
        console.error('Get trips error:', error);
        res.status(500).json({ success: false, message: 'Server error.' });
    }
};

// Get active trips (for customers)
exports.getActiveTrips = async (req, res) => {
    try {
        const [trips] = await pool.query(
            `SELECT t.*, (SELECT COUNT(*) FROM bookings WHERE trip_id = t.id) as booking_count 
       FROM trips t 
       WHERE t.status NOT IN ('completed', 'cancelled') 
       ORDER BY t.departure_date ASC`
        );

        res.json({ success: true, data: trips });
    } catch (error) {
        console.error('Get active trips error:', error);
        res.status(500).json({ success: false, message: 'Server error.' });
    }
};

// Get single trip
exports.getTrip = async (req, res) => {
    try {
        const [trips] = await pool.query(
            `SELECT t.*, u.name as created_by_name,
        (SELECT COUNT(*) FROM bookings WHERE trip_id = t.id) as booking_count,
        (SELECT COUNT(*) FROM bookings WHERE trip_id = t.id AND status = 'delivered') as delivered_count
       FROM trips t LEFT JOIN users u ON t.created_by = u.id WHERE t.id = ?`,
            [req.params.id]
        );

        if (trips.length === 0) {
            return res.status(404).json({ success: false, message: 'Trip not found.' });
        }

        // Get bookings for this trip
        const [bookings] = await pool.query(
            `SELECT b.*, u.name as customer_name, u.phone as customer_phone
       FROM bookings b JOIN users u ON b.customer_id = u.id
       WHERE b.trip_id = ? ORDER BY b.created_at DESC`,
            [req.params.id]
        );

        res.json({ success: true, data: { ...trips[0], bookings } });
    } catch (error) {
        console.error('Get trip error:', error);
        res.status(500).json({ success: false, message: 'Server error.' });
    }
};

// Update trip status (Admin only)
exports.updateTripStatus = async (req, res) => {
    try {
        const { status, delay_reason } = req.body;

        await pool.query(
            'UPDATE trips SET status = ?, delay_reason = ? WHERE id = ?',
            [status, delay_reason || null, req.params.id]
        );

        // Get all customers on this trip for notifications
        const [bookings] = await pool.query(
            'SELECT DISTINCT customer_id FROM bookings WHERE trip_id = ?',
            [req.params.id]
        );

        const [trip] = await pool.query('SELECT * FROM trips WHERE id = ?', [req.params.id]);
        const directionLabel = trip[0].direction === 'manila_to_bohol' ? 'Manila → Bohol' : 'Bohol → Manila';

        // Create notification for each customer
        const statusMessages = {
            picking_up: 'Pickups are now being scheduled for your trip.',
            departed: `The shipment has departed! (${directionLabel})`,
            in_transit: 'Your shipment is now in transit via cargo vessel.',
            delayed: `Trip has been delayed. ${delay_reason || 'Please stand by for updates.'}`,
            arrived: `The shipment has arrived at the destination!`,
            delivering: 'Deliveries are now being made. Expect your items soon!',
            completed: 'All deliveries for this trip have been completed.',
        };

        if (statusMessages[status]) {
            for (const booking of bookings) {
                // Database notification (for in-app list)
                await pool.query(
                    'INSERT INTO notifications (user_id, trip_id, title, message, type) VALUES (?, ?, ?, ?, ?)',
                    [booking.customer_id, req.params.id, 'Trip Update', statusMessages[status], status === 'delayed' ? 'delay' : 'status_update']
                );

                // Real-time Push Notification
                await sendToUser(
                    booking.customer_id,
                    'Trip Update ▸ ' + directionLabel,
                    statusMessages[status],
                    { tripId: req.params.id, type: 'trip_update' }
                );
            }
        }

        res.json({ success: true, message: 'Trip status updated.', data: trip[0] });
    } catch (error) {
        console.error('Update trip status error:', error);
        res.status(500).json({ success: false, message: 'Server error.' });
    }
};

// Update trip details (Admin only)
exports.updateTrip = async (req, res) => {
    try {
        const { direction, departure_date, estimated_arrival, booking_cutoff, notes } = req.body;

        await pool.query(
            'UPDATE trips SET direction = ?, departure_date = ?, estimated_arrival = ?, booking_cutoff = ?, notes = ? WHERE id = ?',
            [direction, departure_date, estimated_arrival || null, booking_cutoff || null, notes || null, req.params.id]
        );

        const [trip] = await pool.query('SELECT * FROM trips WHERE id = ?', [req.params.id]);
        res.json({ success: true, message: 'Trip updated.', data: trip[0] });
    } catch (error) {
        console.error('Update trip error:', error);
        res.status(500).json({ success: false, message: 'Server error.' });
    }
};

// Delete trip (Admin only)
exports.deleteTrip = async (req, res) => {
    try {
        const [bookings] = await pool.query('SELECT COUNT(*) as count FROM bookings WHERE trip_id = ?', [req.params.id]);
        if (bookings[0].count > 0) {
            return res.status(400).json({ success: false, message: 'Cannot delete trip with existing bookings. Cancel it instead.' });
        }

        await pool.query('DELETE FROM trips WHERE id = ?', [req.params.id]);
        res.json({ success: true, message: 'Trip deleted.' });
    } catch (error) {
        console.error('Delete trip error:', error);
        res.status(500).json({ success: false, message: 'Server error.' });
    }
};

// Get trip stats (Admin dashboard)
exports.getTripStats = async (req, res) => {
    try {
        const [activeTrips] = await pool.query(
            "SELECT COUNT(*) as count FROM trips WHERE status NOT IN ('completed', 'cancelled')"
        );
        const [totalBookings] = await pool.query('SELECT COUNT(*) as count FROM bookings');
        const [pendingPickups] = await pool.query(
            "SELECT COUNT(*) as count FROM bookings WHERE status = 'pending_pickup'"
        );
        const [inTransit] = await pool.query(
            "SELECT COUNT(*) as count FROM bookings WHERE status = 'in_transit'"
        );
        const [delivered] = await pool.query(
            "SELECT COUNT(*) as count FROM bookings WHERE status = 'delivered'"
        );
        const [totalCustomers] = await pool.query(
            "SELECT COUNT(*) as count FROM users WHERE role = 'customer'"
        );

        res.json({
            success: true,
            data: {
                activeTrips: activeTrips[0].count,
                totalBookings: totalBookings[0].count,
                pendingPickups: pendingPickups[0].count,
                inTransit: inTransit[0].count,
                delivered: delivered[0].count,
                totalCustomers: totalCustomers[0].count,
            }
        });
    } catch (error) {
        console.error('Get stats error:', error);
        res.status(500).json({ success: false, message: 'Server error.' });
    }
};
