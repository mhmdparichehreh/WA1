// server/game-dao.js
import db from './db.js';

// Saves a completed match to the database for statistics
export const saveMatchResult = (userId, difficulty, outcome, tournamentCode) => {
    return new Promise((resolve, reject) => {
        // Casual games won't have a userId, so we don't save them
        if (!userId) {
            return resolve(null); 
        }

        const sql = 'INSERT INTO matches (user_id, difficulty, outcome, tournament_code) VALUES (?, ?, ?, ?)';
        db.run(sql, [userId, difficulty, outcome, tournamentCode || null], function(err) {
            if (err) reject(err);
            else resolve(this.lastID);
        });
    });
};