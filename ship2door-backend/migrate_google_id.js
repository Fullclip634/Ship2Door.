const mysql = require('mysql2/promise');
(async () => {
    try {
        const db = await mysql.createConnection({
            host: 'localhost', user: 'root', password: '', database: 'ship2door'
        });
        await db.query("ALTER TABLE users ADD COLUMN google_id VARCHAR(255) UNIQUE AFTER email;");
        console.log("Column google_id added successfully.");
        await db.end();
    } catch (e) {
        if (e.code === 'ER_DUP_COLUMN') {
            console.log("Column google_id already exists.");
        } else {
            console.error(e);
        }
    }
})();
