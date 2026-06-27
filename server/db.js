// server/db.js
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Tell Node exactly where the database file is located
const dbPath = path.join(__dirname, 'battleship.sqlite');

// Establish the connection
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Failed to connect to the database:', err.message);
    } else {
        console.log('Successfully connected to the Battleship SQLite database.');
        
        // Enforce foreign key constraints (important for SQLite)
        db.run('PRAGMA foreign_keys = ON;', (pragmaErr) => {
            if (pragmaErr) console.error('Failed to enable foreign keys:', pragmaErr.message);
        });
    }
});

// Export the database object so other files can use it to run queries
module.exports = db;