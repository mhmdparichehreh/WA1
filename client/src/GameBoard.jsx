// client/src/GameBoard.jsx
import { useState } from 'react';

export default function GameBoard({ loggedInUser }) {
    const [gameId, setGameId] = useState(null);
    const [grid, setGrid] = useState([]); 
    const [stats, setStats] = useState({ torpedoes: 0, shipsRemaining: 0, gridSize: 0 });
    const [gameOver, setGameOver] = useState(false);
    const [message, setMessage] = useState('Select a difficulty and start the game!');

    // 1. Start a new match
    const handleStartGame = async (difficulty) => {
        try {
            const response = await fetch('http://localhost:3001/api/matches', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ difficulty, mode: 'casual' }),
                credentials: 'include' // Ensures the backend knows who is playing
            });

            if (response.ok) {
                const data = await response.json();
                setGameId(data.gameId);
                setStats({ 
                    torpedoes: data.torpedoes, 
                    shipsRemaining: data.totalShips, 
                    gridSize: data.gridSize 
                });
                setGameOver(false);
                setMessage(`Game started! You have ${data.torpedoes} torpedoes to sink ${data.totalShips} ships.`);

                // Create an empty visual grid filled with 'unknown' state
                const newGrid = Array(data.gridSize).fill(null).map(() => Array(data.gridSize).fill('unknown'));
                setGrid(newGrid);
            } else {
                setMessage('Failed to start the game. Is the server running?');
            }
        } catch (error) {
            setMessage('Network error while starting game.');
        }
    };

    // 2. Fire a torpedo
    const handleCellClick = async (row, col) => {
        // Prevent clicking if game is over or cell was already clicked
        if (gameOver || grid[row][col] !== 'unknown') return;

        try {
            const response = await fetch(`http://localhost:3001/api/matches/${gameId}/torpedo`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ row, col }),
                credentials: 'include'
            });

            if (response.ok) {
                const data = await response.json();
                
                // Update our visual grid with the result
                const updatedGrid = [...grid];
                updatedGrid[row][col] = data.result.includes('hit') ? 'hit' : 'miss';
                setGrid(updatedGrid);

                // Update stats
                setStats(prev => ({ ...prev, torpedoes: data.torpedoes, shipsRemaining: data.shipsRemaining }));

                // Handle outcomes
                if (data.gameOver) {
                    setGameOver(true);
                    if (data.outcome === 'won') {
                        setMessage(`🎉 YOU WON! You destroyed all the ships with ${data.torpedoes} torpedoes left!`);
                    } else {
                        setMessage(`💥 YOU LOST. You ran out of torpedoes!`);
                    }
                } else if (data.result === 'hit and sunk') {
                    setMessage(`🎯 Direct hit! You sunk a ship! ${data.shipsRemaining} remaining.`);
                } else if (data.result === 'hit') {
                    setMessage('🔥 Hit! Keep firing at that area!');
                } else {
                    setMessage('💦 Splash... just water.');
                }
            }
        } catch (error) {
            console.error('Error firing torpedo:', error);
        }
    };

    // 3. Helper to determine cell color
    const getCellColor = (status) => {
        if (status === 'hit') return '#dc3545'; // Red
        if (status === 'miss') return '#ffffff'; // White
        return '#0d6efd'; // Blue for unknown water
    };

    return (
        <div style={{ maxWidth: '600px', margin: '40px auto', textAlign: 'center', fontFamily: 'sans-serif' }}>
            
            {/* Control Panel */}
            <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
                <h3 style={{ marginTop: 0 }}>Command Center</h3>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginBottom: '10px' }}>
                    <button onClick={() => handleStartGame('Easy')} style={{ padding: '8px 16px', cursor: 'pointer' }}>Start Easy</button>
                    <button onClick={() => handleStartGame('Intermediate')} style={{ padding: '8px 16px', cursor: 'pointer' }}>Start Intermediate</button>
                    <button onClick={() => handleStartGame('Hard')} style={{ padding: '8px 16px', cursor: 'pointer' }}>Start Hard</button>
                </div>
                <p style={{ fontWeight: 'bold', margin: '10px 0 0 0', color: gameOver ? (stats.shipsRemaining === 0 ? 'green' : 'red') : 'black' }}>
                    {message}
                </p>
            </div>

            {/* Game Stats */}
            {gameId && (
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px', fontSize: '18px', fontWeight: 'bold' }}>
                    <span>🚀 Torpedoes: {stats.torpedoes}</span>
                    <span>🚢 Ships Left: {stats.shipsRemaining}</span>
                </div>
            )}

            {/* The Grid */}
            {gameId && (
                <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: `repeat(${stats.gridSize}, 1fr)`, 
                    gap: '2px',
                    backgroundColor: '#333',
                    border: '4px solid #333',
                    borderRadius: '4px'
                }}>
                    {grid.map((rowArr, rowIndex) => (
                        rowArr.map((cellStatus, colIndex) => (
                            <div 
                                key={`${rowIndex}-${colIndex}`}
                                onClick={() => handleCellClick(rowIndex, colIndex)}
                                style={{
                                    aspectRatio: '1 / 1', // Keeps cells perfectly square
                                    backgroundColor: getCellColor(cellStatus),
                                    cursor: (gameOver || cellStatus !== 'unknown') ? 'default' : 'crosshair',
                                    transition: 'background-color 0.2s'
                                }}
                            />
                        ))
                    ))}
                </div>
            )}
        </div>
    );
}