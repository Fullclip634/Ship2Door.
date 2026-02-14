const mysql = require('mysql2/promise');
(async () => {
    try {
        const db = await mysql.createConnection({
            host: 'localhost', user: 'root', password: '', database: 'ship2door'
        });
        const [trips] = await db.query("SELECT id, direction, notes FROM trips");
        trips.forEach(t => console.log(`Trip ${t.id}: ${t.direction} | Notes: ${t.notes}`));

        const [ann] = await db.query("SELECT id, title, message FROM announcements");
        ann.forEach(a => console.log(`Ann ${a.id}: ${a.title} | ${a.message}`));

        await db.end();
    } catch (e) {
        console.error(e);
    }
})();
