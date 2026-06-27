// server/db.js
import sqlite3 from 'sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const sqlite = sqlite3.verbose();

// In modern ES modules, we have to manually create __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Tell Node exactly where the database file is located
const dbPath = join(__dirname, 'battleship.sqlite');

// Establish the connection
const db = new sqlite.Database(dbPath, (err) => {
    if (err) {
        console.error('Failed to connect to the database:', err.message);
    } else {
        console.log('Successfully connected to the Battleship SQLite database.');
        
        // Enforce foreign key constraints
        db.run('PRAGMA foreign_keys = ON;', (pragmaErr) => {
            if (pragmaErr) console.error('Failed to enable foreign keys:', pragmaErr.message);
        });
    }
});

// Export the database object using modern syntax
export default db;