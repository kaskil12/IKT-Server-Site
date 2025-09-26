const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./db.sqlite');

db.serialize(() => {
    db.run('DROP TABLE IF EXISTS Switcher;', (err) => {
        if (err) {
            console.error('Error dropping Switcher table:', err.message);
        } else {
            console.log('Switcher table dropped successfully.');
        }
        db.close();
    });
});