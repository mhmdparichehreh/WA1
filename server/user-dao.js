// server/user-dao.js
import db from './db.js';
import crypto from 'crypto';

// Find a user by ID (used by Passport to manage sessions)
export const getUserById = (id) => {
    return new Promise((resolve, reject) => {
        const sql = 'SELECT * FROM users WHERE id = ?';
        db.get(sql, [id], (err, row) => {
            if (err) reject(err);
            else if (row === undefined) resolve(null);
            else {
                // Only return safe data, never the password or salt
                const user = { id: row.id, username: row.username };
                resolve(user);
            }
        });
    });
};

// Verify username and password (used by Passport for login)
export const getUser = (username, password) => {
    return new Promise((resolve, reject) => {
        const sql = 'SELECT * FROM users WHERE username = ?';
        db.get(sql, [username], (err, row) => {
            if (err) reject(err);
            else if (row === undefined) resolve(false); // User not found
            else {
                const user = { id: row.id, username: row.username };
                
                // Hash the incoming password with the stored salt
                crypto.scrypt(password, row.salt, 32, (err, hashedPassword) => {
                    if (err) reject(err);
                    
                    // Compare the hashes safely
                    const passwordHex = Buffer.from(row.hashed_password, 'hex');
                    if (!crypto.timingSafeEqual(passwordHex, hashedPassword)) {
                        resolve(false); // Wrong password
                    } else {
                        resolve(user); // Correct password!
                    }
                });
            }
        });
    });
};