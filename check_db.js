const mysql = require('mysql2/promise');
(async () => {
    const db = await mysql.createConnection({
        host: 'localhost', user: 'root', password: '', database: 'ship2door'
    });
    const [ann] = await db.query("SELECT * FROM announcements");
    console.log("Announcements:", JSON.stringify(ann));
    const [trips] = await db.query("SELECT * FROM trips");
    console.log("Trips:", JSON.stringify(trips));
    await db.end();
})();
