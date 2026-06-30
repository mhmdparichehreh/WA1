// client/src/GameBoard.jsx
import { useState } from 'react';

export default function GameBoard({ loggedInUser }) {
    const [gameId, setGameId] = useState(null);
    const [grid, setGrid] = useState([]); 
    const [stats, setStats] = useState({ torpedoes: 0, shipsRemaining: 0, gridSize: 0 });
    const [gameOver, setGameOver] = useState(false);
    const [message, setMessage] = useState('Select a difficulty and start the game!');
    
    const [tournamentInput, setTournamentInput] = useState('');
    const [activeTournamentCode, setActiveTournamentCode] = useState(null);
    const [playMode, setPlayMode] = useState('casual'); 

    const handleStartGame = async (difficulty, mode = 'casual', tCode = null) => {
        try {
            const response = await fetch('http://localhost:3001/api/matches', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ difficulty, mode, tournamentCode: tCode }),
                credentials: 'include' 
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
                setActiveTournamentCode(data.tournamentCode); 

                if (mode === 'tournament') {
                    setMessage(`🏆 TOURNAMENT ACTIVE! Your share code is: ${data.tournamentCode}`);
                } else {
                    setMessage(`Casual Match started! Sink ${data.totalShips} ships.`);
                }

                const newGrid = Array(data.gridSize).fill(null).map(() => Array(data.gridSize).fill('unknown'));
                setGrid(newGrid);
            } else {
                setMessage('Failed to start the game. Check server connection.');
            }
        } catch (error) {
            setMessage('Network error while starting game.');
        }
    };

    const handleCellClick = async (row, col) => {
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
                
                const updatedGrid = [...grid];
                updatedGrid[row][col] = data.result.includes('hit') ? 'hit' : 'miss';
                
                setStats(prev => ({ ...prev, torpedoes: data.torpedoes, shipsRemaining: data.shipsRemaining }));

                if (data.gameOver) {
                    setGameOver(true);
                    
                    // --- NEW REVEAL LOGIC ---
                    // If the backend sent final positions, reveal the un-hit ship segments
                    if (data.finalPositions) {
                        data.finalPositions.forEach(ship => {
                            ship.cells.forEach(cell => {
                                if (updatedGrid[cell.row][cell.col] === 'unknown') {
                                    updatedGrid[cell.row][cell.col] = 'revealed';
                                }
                            });
                        });
                    }

                    if (data.outcome === 'won') {
                        setMessage(`🎉 YOU WON! You destroyed all the ships with ${data.torpedoes} torpedoes left!`);
                    } else {
                        setMessage(`💥 YOU LOST. The remaining ships have been revealed!`);
                    }
                } else if (data.result === 'hit and sunk') {
                    setMessage(`🎯 Direct hit! You sunk a ship! ${data.shipsRemaining} remaining.`);
                } else if (data.result === 'hit') {
                    setMessage('🔥 Hit! Keep firing at that area!');
                } else {
                    setMessage('💦 Splash... just water.');
                }

                // Update the state once with all changes
                setGrid(updatedGrid);
            }
        } catch (error) {
            console.error('Error firing torpedo:', error);
        }
    };

    // --- UPDATED COLOR LOGIC ---
    const getCellColor = (status) => {
        if (status === 'hit') return '#dc3545'; // Red
        if (status === 'miss') return '#ffffff'; // White
        if (status === 'revealed') return '#6c757d'; // Grey for un-hit ships
        return '#0d6efd'; // Blue for unknown water
    };

    return (
        <div style={{ maxWidth: '600px', margin: '40px auto', textAlign: 'center', fontFamily: 'sans-serif' }}>
            
            <div style={{ marginBottom: '20px', backgroundColor: '#f8f9fa', borderRadius: '8px', overflow: 'hidden', border: '1px solid #ddd' }}>
                <div style={{ display: 'flex' }}>
                    <button 
                        onClick={() => setPlayMode('casual')}
                        style={{ flex: 1, padding: '10px', cursor: 'pointer', border: 'none', backgroundColor: playMode === 'casual' ? '#007BFF' : '#e9ecef', color: playMode === 'casual' ? 'white' : 'black', fontWeight: 'bold' }}
                    >
                        Casual Play
                    </button>
                    <button 
                        onClick={() => setPlayMode('tournament')}
                        style={{ flex: 1, padding: '10px', cursor: 'pointer', border: 'none', backgroundColor: playMode === 'tournament' ? '#28a745' : '#e9ecef', color: playMode === 'tournament' ? 'white' : 'black', fontWeight: 'bold' }}
                    >
                        Tournament Mode
                    </button>
                </div>

                <div style={{ padding: '20px' }}>
                    {playMode === 'casual' ? (
                        <div>
                            <h4>Start a Casual Match</h4>
                            <div style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
                                <button onClick={() => handleStartGame('Easy', 'casual')} style={{ padding: '8px 16px', cursor: 'pointer' }}>Easy</button>
                                <button onClick={() => handleStartGame('Intermediate', 'casual')} style={{ padding: '8px 16px', cursor: 'pointer' }}>Medium</button>
                                <button onClick={() => handleStartGame('Hard', 'casual')} style={{ padding: '8px 16px', cursor: 'pointer' }}>Hard</button>
                            </div>
                        </div>
                    ) : (
                        <div>
                            <h4>Tournament Lobby</h4>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', alignItems: 'center' }}>
                                <div>
                                    <p style={{ margin: '0 0 10px 0', fontSize: '14px' }}>Generate a new shareable tournament:</p>
                                    <div style={{ display: 'flex', justifyContent: 'center', gap: '5px' }}>
                                        <button onClick={() => handleStartGame('Easy', 'tournament')} style={{ padding: '8px 12px', cursor: 'pointer', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px' }}>Create Easy</button>
                                        <button onClick={() => handleStartGame('Intermediate', 'tournament')} style={{ padding: '8px 12px', cursor: 'pointer', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px' }}>Create Medium</button>
                                        <button onClick={() => handleStartGame('Hard', 'tournament')} style={{ padding: '8px 12px', cursor: 'pointer', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px' }}>Create Hard</button>
                                    </div>
                                </div>
                                
                                <hr style={{ width: '80%', border: '1px solid #ddd' }} />

                                <div>
                                    <p style={{ margin: '0 0 10px 0', fontSize: '14px' }}>Or join an existing tournament:</p>
                                    <div style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
                                        <input 
                                            type="text" 
                                            placeholder="Enter 6-char code" 
                                            value={tournamentInput} 
                                            onChange={(e) => setTournamentInput(e.target.value.toUpperCase())}
                                            maxLength={6}
                                            style={{ padding: '8px', width: '130px', textAlign: 'center', textTransform: 'uppercase' }}
                                        />
                                        <button 
                                            onClick={() => handleStartGame('Easy', 'tournament', tournamentInput)}
                                            disabled={tournamentInput.length !== 6}
                                            style={{ padding: '8px 16px', cursor: tournamentInput.length === 6 ? 'pointer' : 'not-allowed', backgroundColor: '#ffc107', border: 'none', borderRadius: '4px' }}
                                        >
                                            Join
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
                
                <div style={{ padding: '10px', backgroundColor: '#333', color: 'white' }}>
                    <p style={{ fontWeight: 'bold', margin: 0, color: gameOver ? (stats.shipsRemaining === 0 ? '#28a745' : '#dc3545') : 'white' }}>
                        {message}
                    </p>
                </div>
            </div>

            {gameId && (
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px', fontSize: '18px', fontWeight: 'bold' }}>
                    <span>🚀 Torpedoes: {stats.torpedoes}</span>
                    {activeTournamentCode && <span style={{ color: '#28a745' }}>Code: {activeTournamentCode}</span>}
                    <span>🚢 Ships Left: {stats.shipsRemaining}</span>
                </div>
            )}

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
                                    aspectRatio: '1 / 1',
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