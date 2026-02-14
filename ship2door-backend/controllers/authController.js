const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');
const { OAuth2Client } = require('google-auth-library');
require('dotenv').config();

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const generateToken = (user) => {
    return jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN }
    );
};

// Register a new customer
exports.register = async (req, res) => {
    try {
        const { name, email, phone, password, address_manila, address_bohol } = req.body;

        // Check if user exists
        const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
        if (existing.length > 0) {
            return res.status(400).json({ success: false, message: 'Email already registered.' });
        }

        const hashedPassword = await bcrypt.hash(password, 12);
        const [result] = await pool.query(
            'INSERT INTO users (name, email, phone, password, role, address_manila, address_bohol) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [name, email, phone, hashedPassword, 'customer', address_manila || null, address_bohol || null]
        );

        const token = generateToken({ id: result.insertId, email, role: 'customer' });

        res.status(201).json({
            success: true,
            message: 'Account created successfully.',
            data: {
                token,
                user: { id: result.insertId, name, email, phone, role: 'customer' }
            }
        });
    } catch (error) {
        console.error('Register error:', error);
        res.status(500).json({ success: false, message: 'Server error.' });
    }
};

// Login
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const [users] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
        if (users.length === 0) {
            return res.status(401).json({ success: false, message: 'Invalid email or password.' });
        }

        const user = users[0];
        if (!user.is_active) {
            return res.status(403).json({ success: false, message: 'Account is deactivated.' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'Invalid email or password.' });
        }

        const token = generateToken(user);

        res.json({
            success: true,
            data: {
                token,
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    phone: user.phone,
                    role: user.role,
                    address_manila: user.address_manila,
                    address_bohol: user.address_bohol,
                    avatar_url: user.avatar_url,
                }
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ success: false, message: 'Server error.' });
    }
};

// Get current user profile
exports.getProfile = async (req, res) => {
    try {
        const [users] = await pool.query(
            'SELECT id, name, email, phone, role, address_manila, address_bohol, avatar_url, created_at FROM users WHERE id = ?',
            [req.user.id]
        );

        if (users.length === 0) {
            return res.status(404).json({ success: false, message: 'User not found.' });
        }

        res.json({ success: true, data: users[0] });
    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({ success: false, message: 'Server error.' });
    }
};

// Update profile
exports.updateProfile = async (req, res) => {
    try {
        const { name, phone, address_manila, address_bohol } = req.body;

        await pool.query(
            'UPDATE users SET name = ?, phone = ?, address_manila = ?, address_bohol = ? WHERE id = ?',
            [name, phone, address_manila || null, address_bohol || null, req.user.id]
        );

        const [users] = await pool.query(
            'SELECT id, name, email, phone, role, address_manila, address_bohol, avatar_url FROM users WHERE id = ?',
            [req.user.id]
        );

        res.json({ success: true, message: 'Profile updated.', data: users[0] });
    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({ success: false, message: 'Server error.' });
    }
};

// Change password
exports.changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        const [users] = await pool.query('SELECT password FROM users WHERE id = ?', [req.user.id]);
        const isMatch = await bcrypt.compare(currentPassword, users[0].password);
        if (!isMatch) {
            return res.status(400).json({ success: false, message: 'Current password is incorrect.' });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 12);
        await pool.query('UPDATE users SET password = ? WHERE id = ?', [hashedPassword, req.user.id]);

        res.json({ success: true, message: 'Password updated successfully.' });
    } catch (error) {
        console.error('Change password error:', error);
        res.status(500).json({ success: false, message: 'Server error.' });
    }
};

// Google Login
exports.googleLogin = async (req, res) => {
    try {
        const { idToken } = req.body;
        if (!idToken) {
            return res.status(400).json({ success: false, message: 'Google ID token is required.' });
        }

        const ticket = await client.verifyIdToken({
            idToken,
            audience: process.env.GOOGLE_CLIENT_ID,
        });
        const payload = ticket.getPayload();
        const { sub: google_id, email, name, picture } = payload;

        // Check if user exists with this google__id
        const [usersById] = await pool.query('SELECT * FROM users WHERE google_id = ?', [google_id]);

        let user;
        if (usersById.length > 0) {
            user = usersById[0];
        } else {
            // Check if user exists with this email but no google_id
            const [usersByEmail] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
            if (usersByEmail.length > 0) {
                // Link account
                await pool.query('UPDATE users SET google_id = ?, avatar_url = ? WHERE id = ?',
                    [google_id, picture || usersByEmail[0].avatar_url, usersByEmail[0].id]);
                user = { ...usersByEmail[0], google_id, avatar_url: picture || usersByEmail[0].avatar_url };
            } else {
                // Create new user (autogenerate password since it's required in schema, but won't be used)
                const dummyPassword = await bcrypt.hash(Math.random().toString(36), 12);
                const [result] = await pool.query(
                    'INSERT INTO users (name, email, google_id, password, role, avatar_url) VALUES (?, ?, ?, ?, ?, ?)',
                    [name, email, google_id, dummyPassword, 'customer', picture || null]
                );
                const [newUser] = await pool.query('SELECT * FROM users WHERE id = ?', [result.insertId]);
                user = newUser[0];
            }
        }

        if (!user.is_active) {
            return res.status(403).json({ success: false, message: 'Account is deactivated.' });
        }

        const token = generateToken(user);

        res.json({
            success: true,
            data: {
                token,
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    phone: user.phone,
                    role: user.role,
                    address_manila: user.address_manila,
                    address_bohol: user.address_bohol,
                    avatar_url: user.avatar_url,
                }
            }
        });
    } catch (error) {
        console.error('Google login error:', error);
        res.status(500).json({ success: false, message: 'Server error during Google authentication.' });
    }
};

// Admin: Get all customers
exports.getAllCustomers = async (req, res) => {
    try {
        const [customers] = await pool.query(
            'SELECT id, name, email, phone, address_manila, address_bohol, is_active, created_at FROM users WHERE role = ? ORDER BY created_at DESC',
            ['customer']
        );

        res.json({ success: true, data: customers });
    } catch (error) {
        console.error('Get customers error:', error);
        res.status(500).json({ success: false, message: 'Server error.' });
    }
};
