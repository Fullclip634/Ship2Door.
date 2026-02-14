const pool = require('../config/db');

// Generate unique booking number
const generateBookingNumber = () => {
    const prefix = 'S2D';
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 5).toUpperCase();
    return `${prefix}-${timestamp}${random}`;
};

// Create a booking (Customer)
exports.createBooking = async (req, res) => {
    try {
        const {
            trip_id, sender_name, sender_phone, sender_address,
            receiver_name, receiver_phone, receiver_address,
            special_instructions, items
        } = req.body;

        // Verify trip exists and is accepting bookings
        const [trips] = await pool.query('SELECT * FROM trips WHERE id = ?', [trip_id]);
        if (trips.length === 0) {
            return res.status(404).json({ success: false, message: 'Trip not found.' });
        }

        const trip = trips[0];
        if (['completed', 'cancelled', 'departed', 'in_transit'].includes(trip.status)) {
            return res.status(400).json({ success: false, message: 'This trip is no longer accepting bookings.' });
        }

        if (trip.booking_cutoff && new Date(trip.booking_cutoff) < new Date()) {
            return res.status(400).json({ success: false, message: 'Booking cutoff date has passed.' });
        }

        const bookingNumber = generateBookingNumber();

        const [result] = await pool.query(
            `INSERT INTO bookings (booking_number, trip_id, customer_id, sender_name, sender_phone, sender_address,
        receiver_name, receiver_phone, receiver_address, special_instructions)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [bookingNumber, trip_id, req.user.id, sender_name, sender_phone, sender_address,
                receiver_name, receiver_phone, receiver_address, special_instructions || null]
        );

        // Insert items
        if (items && items.length > 0) {
            for (const item of items) {
                await pool.query(
                    'INSERT INTO items (booking_id, description, quantity, size_estimate, weight_estimate, notes) VALUES (?, ?, ?, ?, ?, ?)',
                    [result.insertId, item.description, item.quantity || 1, item.size_estimate || null, item.weight_estimate || null, item.notes || null]
                );
            }
        }

        // Notify admin
        const [admins] = await pool.query("SELECT id FROM users WHERE role = 'admin'");
        for (const admin of admins) {
            await pool.query(
                'INSERT INTO notifications (user_id, trip_id, booking_id, title, message, type) VALUES (?, ?, ?, ?, ?, ?)',
                [admin.id, trip_id, result.insertId, 'New Booking', `New booking ${bookingNumber} from ${sender_name}`, 'status_update']
            );
        }

        const [booking] = await pool.query('SELECT * FROM bookings WHERE id = ?', [result.insertId]);
        const [bookingItems] = await pool.query('SELECT * FROM items WHERE booking_id = ?', [result.insertId]);

        res.status(201).json({
            success: true,
            message: 'Booking created successfully.',
            data: { ...booking[0], items: bookingItems }
        });
    } catch (error) {
        console.error('Create booking error:', error);
        res.status(500).json({ success: false, message: 'Server error.' });
    }
};

// Get bookings for current user (Customer)
exports.getMyBookings = async (req, res) => {
    try {
        const { status, page = 1, limit = 20 } = req.query;
        let query = `SELECT b.*, t.direction, t.departure_date, t.status as trip_status, t.estimated_arrival
                 FROM bookings b JOIN trips t ON b.trip_id = t.id
                 WHERE b.customer_id = ?`;
        const params = [req.user.id];

        if (status) {
            query += ' AND b.status = ?';
            params.push(status);
        }

        query += ' ORDER BY b.created_at DESC LIMIT ? OFFSET ?';
        params.push(parseInt(limit), (parseInt(page) - 1) * parseInt(limit));

        const [bookings] = await pool.query(query, params);

        // Get items for each booking
        for (let i = 0; i < bookings.length; i++) {
            const [items] = await pool.query('SELECT * FROM items WHERE booking_id = ?', [bookings[i].id]);
            bookings[i].items = items;
        }

        res.json({ success: true, data: bookings });
    } catch (error) {
        console.error('Get my bookings error:', error);
        res.status(500).json({ success: false, message: 'Server error.' });
    }
};

// Get single booking
exports.getBooking = async (req, res) => {
    try {
        let query = `SELECT b.*, t.direction, t.departure_date, t.status as trip_status, t.estimated_arrival, t.delay_reason,
                   u.name as customer_name, u.phone as customer_phone, u.email as customer_email
                 FROM bookings b
                 JOIN trips t ON b.trip_id = t.id
                 JOIN users u ON b.customer_id = u.id
                 WHERE b.id = ?`;
        const params = [req.params.id];

        // Customers can only view their own bookings
        if (req.user.role !== 'admin') {
            query += ' AND b.customer_id = ?';
            params.push(req.user.id);
        }

        const [bookings] = await pool.query(query, params);

        if (bookings.length === 0) {
            return res.status(404).json({ success: false, message: 'Booking not found.' });
        }

        const [items] = await pool.query('SELECT * FROM items WHERE booking_id = ?', [req.params.id]);

        res.json({ success: true, data: { ...bookings[0], items } });
    } catch (error) {
        console.error('Get booking error:', error);
        res.status(500).json({ success: false, message: 'Server error.' });
    }
};

// Get all bookings (Admin)
exports.getAllBookings = async (req, res) => {
    try {
        const { trip_id, status, search, page = 1, limit = 20 } = req.query;
        let query = `SELECT b.*, t.direction, t.departure_date, t.status as trip_status,
                   u.name as customer_name, u.phone as customer_phone
                 FROM bookings b
                 JOIN trips t ON b.trip_id = t.id
                 JOIN users u ON b.customer_id = u.id`;
        const params = [];
        const conditions = [];

        if (trip_id) {
            conditions.push('b.trip_id = ?');
            params.push(trip_id);
        }
        if (status) {
            conditions.push('b.status = ?');
            params.push(status);
        }
        if (search) {
            conditions.push('(b.booking_number LIKE ? OR b.sender_name LIKE ? OR b.receiver_name LIKE ? OR u.name LIKE ?)');
            const s = `%${search}%`;
            params.push(s, s, s, s);
        }

        if (conditions.length > 0) {
            query += ' WHERE ' + conditions.join(' AND ');
        }

        query += ' ORDER BY b.created_at DESC LIMIT ? OFFSET ?';
        params.push(parseInt(limit), (parseInt(page) - 1) * parseInt(limit));

        const [bookings] = await pool.query(query, params);

        res.json({ success: true, data: bookings });
    } catch (error) {
        console.error('Get all bookings error:', error);
        res.status(500).json({ success: false, message: 'Server error.' });
    }
};

// Update booking status (Admin)
exports.updateBookingStatus = async (req, res) => {
    try {
        const { status } = req.body;

        const [bookings] = await pool.query('SELECT * FROM bookings WHERE id = ?', [req.params.id]);
        if (bookings.length === 0) {
            return res.status(404).json({ success: false, message: 'Booking not found.' });
        }

        const updates = { status };
        if (status === 'delivered') {
            updates.delivered_at = new Date();
        }

        await pool.query('UPDATE bookings SET status = ?, delivered_at = ? WHERE id = ?',
            [status, updates.delivered_at || null, req.params.id]
        );

        // Notify customer
        const statusMessages = {
            picked_up: 'Your items have been picked up!',
            in_transit: 'Your shipment is now in transit.',
            arrived: 'Your shipment has arrived at the destination.',
            out_for_delivery: 'Your items are out for delivery!',
            delivered: 'Your items have been delivered successfully!',
            cancelled: 'Your booking has been cancelled.',
        };

        if (statusMessages[status]) {
            await pool.query(
                'INSERT INTO notifications (user_id, booking_id, title, message, type) VALUES (?, ?, ?, ?, ?)',
                [bookings[0].customer_id, req.params.id, 'Booking Update', statusMessages[status], status === 'delivered' ? 'delivery' : 'status_update']
            );
        }

        const [updated] = await pool.query('SELECT * FROM bookings WHERE id = ?', [req.params.id]);
        res.json({ success: true, message: 'Booking status updated.', data: updated[0] });
    } catch (error) {
        console.error('Update booking status error:', error);
        res.status(500).json({ success: false, message: 'Server error.' });
    }
};

// Update pickup schedule (Admin)
exports.updatePickupSchedule = async (req, res) => {
    try {
        const { pickup_date, pickup_time_window } = req.body;

        await pool.query(
            'UPDATE bookings SET pickup_date = ?, pickup_time_window = ? WHERE id = ?',
            [pickup_date, pickup_time_window || null, req.params.id]
        );

        // Notify customer
        const [bookings] = await pool.query('SELECT * FROM bookings WHERE id = ?', [req.params.id]);
        await pool.query(
            'INSERT INTO notifications (user_id, booking_id, title, message, type) VALUES (?, ?, ?, ?, ?)',
            [bookings[0].customer_id, req.params.id, 'Pickup Scheduled', `Your items will be picked up on ${pickup_date}${pickup_time_window ? ' (' + pickup_time_window + ')' : ''}.`, 'pickup_reminder']
        );

        res.json({ success: true, message: 'Pickup schedule updated.', data: bookings[0] });
    } catch (error) {
        console.error('Update pickup error:', error);
        res.status(500).json({ success: false, message: 'Server error.' });
    }
};
