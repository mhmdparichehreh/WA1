// server/index.js
import express from 'express';
import cors from 'cors';
import session from 'express-session';
import passport from 'passport';
import LocalStrategy from 'passport-local';
import crypto from 'crypto';

import db from './db.js';
import { getUser, getUserById } from './user-dao.js';
import { generateGameGrid, getDifficultyConfig } from './game-engine.js';
import { saveMatchResult } from './game-dao.js';

const app = express();
const port = 3001;

// In-memory store for active matches (gameId -> gameState)
const activeGames = new Map();

// --- MIDDLEWARE ---
app.use(express.json());

const corsOptions = {
    origin: 'http://localhost:5173',
    credentials: true,
};
app.use(cors(corsOptions));

// --- PASSPORT & SESSION SETUP ---
passport.use(new LocalStrategy(async (username, password, done) => {
    try {
        const user = await getUser(username, password);
        if (!user) return done(null, false, { message: 'Incorrect username or password.' });
        return done(null, user);
    } catch (err) {
        return done(err);
    }
}));

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
    try {
        const user = await getUserById(id);
        done(null, user);
    } catch (err) {
        done(err, null);
    }
});

app.use(session({
    secret: 'battleship super secret string for exam',
    resave: false,
    saveUninitialized: false,
}));
app.use(passport.initialize());
app.use(passport.session());


// --- AUTHENTICATION ROUTES ---

app.post('/api/sessions', passport.authenticate('local'), (req, res) => {
    res.status(201).json(req.user);
});

app.get('/api/sessions/current', (req, res) => {
    if (req.isAuthenticated()) {
        res.status(200).json(req.user);
    } else {
        res.status(401).json({ error: 'Not authenticated' });
    }
});

app.delete('/api/sessions/current', (req, res) => {
    req.logout(() => {
        res.end();
    });
});


// --- GAME ROUTES ---

// 1. Start a new match
app.post('/api/matches', (req, res) => {
    const { difficulty, mode, tournamentCode } = req.body; 
    
    const config = getDifficultyConfig(difficulty || 'Easy');
    let gameId = crypto.randomUUID();
    let gridData;
    let tCode = null;

    if (mode === 'tournament') {
        if (tournamentCode) {
            gridData = generateGameGrid(config.gridSize, config.ships);
            tCode = tournamentCode;
        } else {
            gridData = generateGameGrid(config.gridSize, config.ships);
            tCode = crypto.randomBytes(3).toString('hex').toUpperCase();
        }
    } else {
        gridData = generateGameGrid(config.gridSize, config.ships);
    }

    activeGames.set(gameId, {
        userId: req.isAuthenticated() ? req.user.id : null,
        difficulty: difficulty || 'Easy',
        mode: mode || 'casual',
        tournamentCode: tCode,
        ships: gridData.ships,
        grid: gridData.grid,
        torpedoes: config.maxTorpedoes,
        shipsRemaining: config.ships.length
    });

    res.status(201).json({
        gameId,
        gridSize: config.gridSize,
        torpedoes: config.maxTorpedoes,
        totalShips: config.ships.length,
        shipSizes: config.ships,
        tournamentCode: tCode
    });
});

// 2. Launch a torpedo
app.post('/api/matches/:id/torpedo', async (req, res) => {
    const gameId = req.params.id;
    const { row, col } = req.body;
    
    const game = activeGames.get(gameId);
    if (!game) return res.status(404).json({ error: 'Game not found or already finished.' });

    const cellContent = game.grid[row][col];
    let result = 'water';

    if (cellContent === null) {
        game.torpedoes -= 1;
    } else {
        const shipId = cellContent;
        const ship = game.ships.find(s => s.id === shipId);
        
        if (!ship.sunk) {
            ship.hits += 1;
            if (ship.hits === ship.size) {
                ship.sunk = true;
                game.shipsRemaining -= 1;
                result = 'hit and sunk';
            } else {
                result = 'hit';
            }
        }
        game.grid[row][col] = 'X'; 
    }

    let gameOver = false;
    let finalPositions = null;
    let outcome = null;

    if (game.shipsRemaining === 0) {
        gameOver = true;
        outcome = 'won';
    } else if (game.torpedoes === 0) {
        gameOver = true;
        outcome = 'lost';
    }

    if (gameOver) {
        await saveMatchResult(game.userId, game.difficulty, outcome, game.tournamentCode);
        finalPositions = game.ships;
        activeGames.delete(gameId);
    }

    res.json({
        result,
        torpedoes: game.torpedoes,
        shipsRemaining: game.shipsRemaining,
        gameOver,
        outcome,
        finalPositions
    });
});


// --- START SERVER ---
app.listen(port, () => {
    console.log(`Battleship server listening at http://localhost:${port}`);
});