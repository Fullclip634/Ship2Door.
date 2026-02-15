-- Ship2Door Database Schema
-- MySQL

CREATE DATABASE IF NOT EXISTS ship2door;
USE ship2door;

-- Users table (customers and admin)
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    google_id VARCHAR(255) UNIQUE,
    phone VARCHAR(20),
    password VARCHAR(255) NOT NULL,
    role ENUM('admin', 'customer') DEFAULT 'customer',
    address_manila TEXT,
    address_bohol TEXT,
    avatar_url VARCHAR(500),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    push_token VARCHAR(255)
);

-- Trips table
CREATE TABLE trips (
    id INT AUTO_INCREMENT PRIMARY KEY,
    direction ENUM('manila_to_bohol', 'bohol_to_manila') NOT NULL,
    departure_date DATE NOT NULL,
    estimated_arrival DATE,
    booking_cutoff DATE,
    status ENUM('scheduled', 'picking_up', 'departed', 'in_transit', 'delayed', 'arrived', 'delivering', 'completed', 'cancelled') DEFAULT 'scheduled',
    delay_reason TEXT,
    notes TEXT,
    created_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
);

-- Bookings table
CREATE TABLE bookings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    booking_number VARCHAR(20) UNIQUE NOT NULL,
    trip_id INT NOT NULL,
    customer_id INT NOT NULL,
    status ENUM('pending_pickup', 'picked_up', 'in_transit', 'arrived', 'out_for_delivery', 'delivered', 'cancelled') DEFAULT 'pending_pickup',
    sender_name VARCHAR(100) NOT NULL,
    sender_phone VARCHAR(20) NOT NULL,
    sender_address TEXT NOT NULL,
    receiver_name VARCHAR(100) NOT NULL,
    receiver_phone VARCHAR(20) NOT NULL,
    receiver_address TEXT NOT NULL,
    special_instructions TEXT,
    pickup_date DATE,
    pickup_time_window VARCHAR(50),
    delivered_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (trip_id) REFERENCES trips(id) ON DELETE CASCADE,
    FOREIGN KEY (customer_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Items table (each booking can have multiple items)
CREATE TABLE items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    booking_id INT NOT NULL,
    description VARCHAR(255) NOT NULL,
    quantity INT DEFAULT 1,
    size_estimate VARCHAR(50),
    weight_estimate DECIMAL(10, 2),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE
);

-- Announcements table
CREATE TABLE announcements (
    id INT AUTO_INCREMENT PRIMARY KEY,
    trip_id INT,
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    type ENUM('trip', 'delay', 'general', 'pickup') DEFAULT 'general',
    created_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (trip_id) REFERENCES trips(id) ON DELETE SET NULL,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
);

-- Notifications table
CREATE TABLE notifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    trip_id INT,
    booking_id INT,
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    type ENUM('status_update', 'pickup_reminder', 'announcement', 'delay', 'delivery') DEFAULT 'status_update',
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (trip_id) REFERENCES trips(id) ON DELETE SET NULL,
    FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE SET NULL
);

-- Indexes for performance
CREATE INDEX idx_bookings_trip ON bookings(trip_id);
CREATE INDEX idx_bookings_customer ON bookings(customer_id);
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_trips_status ON trips(status);
CREATE INDEX idx_trips_direction ON trips(direction);
CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(is_read);
CREATE INDEX idx_items_booking ON items(booking_id);

-- Insert default admin user (password: 12345678)
INSERT INTO users (name, email, phone, password, role, address_bohol)
VALUES ('Ship2Door Admin', 'admin@ship2door.com', '09171234567', '$2b$12$JJx6dZieyz1/gExutzDirOPWlwYWT81Ky0xyOjJRT5sqvCmgSLSIS', 'admin', 'Bohol, Philippines');
