const mysql = require('mysql2/promise');
(async () => {
    try {
        const db = await mysql.createConnection({
            host: 'localhost', user: 'root', password: '', database: 'ship2door'
        });
        const [trips] = await db.query("SELECT * FROM trips");
        console.log("trips_data:", JSON.stringify(trips));
        const [ann] = await db.query("SELECT * FROM announcements");
        console.log("announcements_data:", JSON.stringify(ann));
        await db.end();
    } catch (e) {
        console.error(e);
    }
})();
