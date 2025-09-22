const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./db.sqlite');
db.serialize(() => {
    db.run('DROP TABLE IF EXISTS Users;', (err) => {
        if (err) {
            console.error('Error dropping Users table:', err.message);
        } else {
            console.log('Users table dropped.');
        }
        db.close();
    });
});