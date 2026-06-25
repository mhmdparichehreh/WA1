-- server/schema.sql

-- Users Table
-- Stores user credentials securely. Passwords must be hashed with a salt.
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    hashed_password TEXT NOT NULL,
    salt TEXT NOT NULL
);

-- Matches Table
-- Tracks every finished game for logged-in users to calculate statistics later.
CREATE TABLE IF NOT EXISTS matches (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    difficulty TEXT CHECK(difficulty IN ('Easy', 'Intermediate', 'Hard')) NOT NULL,
    outcome TEXT CHECK(outcome IN ('won', 'lost')) NOT NULL,
    tournament_code TEXT, -- Nullable, used if the match was part of a tournament
    date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
