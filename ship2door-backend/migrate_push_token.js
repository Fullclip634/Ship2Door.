const mysql = require('mysql2/promise');
require('dotenv').config();

(async () => {
    try {
        const pool = mysql.createPool({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
            waitForConnections: true,
            connectionLimit: 10,
            queueLimit: 0
        });

        console.log('Adding push_token column to users table...');

        // Add push_token column if it doesn't exist
        await pool.query(`
            ALTER TABLE users 
            ADD COLUMN IF NOT EXISTS push_token VARCHAR(255) DEFAULT NULL;
        `);

        console.log('Successfully updated users table.');
        await pool.end();
        process.exit(0);
    } catch (error) {
        console.error('Migration error:', error);
        process.exit(1);
    }
})();
