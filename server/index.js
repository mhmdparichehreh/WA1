// server/index.js
import express from 'express';
import cors from 'cors';
import db from './db.js'; // Note: The .js extension is strictly required here now!

const app = express();
const port = 3001; 

// --- MIDDLEWARE ---
app.use(express.json()); 

// Configure CORS for the "two servers" pattern
const corsOptions = {
    origin: 'http://localhost:5173', 
    credentials: true, 
};
app.use(cors(corsOptions));

// --- ROUTES ---

// A simple test route
app.get('/api/test', (req, res) => {
    res.json({ message: 'Battleship API is running successfully!' });
});

// --- START SERVER ---
app.listen(port, () => {
    console.log(`Battleship server listening at http://localhost:${port}`);
});