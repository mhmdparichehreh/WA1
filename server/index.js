// server/index.js
import express from 'express';
import cors from 'cors';
import session from 'express-session';
import passport from 'passport';
import LocalStrategy from 'passport-local';
import db from './db.js';
import { getUser, getUserById } from './user-dao.js';

const app = express();
const port = 3001; 

// --- MIDDLEWARE ---
app.use(express.json()); 

const corsOptions = {
    origin: 'http://localhost:5173', 
    credentials: true, 
};
app.use(cors(corsOptions));

// --- PASSPORT & SESSION SETUP ---
// Configure Passport to use our user-dao for verifying credentials
passport.use(new LocalStrategy(async (username, password, done) => {
    try {
        const user = await getUser(username, password);
        if (!user) return done(null, false, { message: 'Incorrect username or password.' });
        return done(null, user);
    } catch (err) {
        return done(err);
    }
}));

// Tell Passport how to store the user in the session cookie
passport.serializeUser((user, done) => {
    done(null, user.id);
});

// Tell Passport how to retrieve the user from the session cookie
passport.deserializeUser(async (id, done) => {
    try {
        const user = await getUserById(id);
        done(null, user);
    } catch (err) {
        done(err, null);
    }
});

// Initialize the Express session
app.use(session({
    secret: 'battleship super secret string for exam',
    resave: false,
    saveUninitialized: false,
}));
app.use(passport.initialize());
app.use(passport.session());

// --- AUTHENTICATION ROUTES ---

// 1. Login
app.post('/api/sessions', passport.authenticate('local'), (req, res) => {
    res.status(201).json(req.user);
});

// 2. Check if currently logged in
app.get('/api/sessions/current', (req, res) => {
    if (req.isAuthenticated()) {
        res.status(200).json(req.user);
    } else {
        res.status(401).json({ error: 'Not authenticated' });
    }
});

// 3. Logout
app.delete('/api/sessions/current', (req, res) => {
    req.logout(() => {
        res.end();
    });
});

// --- START SERVER ---
app.listen(port, () => {
    console.log(`Battleship server listening at http://localhost:${port}`);
});