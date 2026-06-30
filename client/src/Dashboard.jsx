// client/src/Dashboard.jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

export default function Dashboard({ loggedInUser }) {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const response = await fetch('http://localhost:3001/api/matches/history', {
                    credentials: 'include'
                });
                if (response.ok) {
                    const data = await response.json();
                    setHistory(data);
                }
            } catch (error) {
                console.error('Failed to fetch history:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchHistory();
    }, []);

    if (loading) return <div style={{ textAlign: 'center', marginTop: '50px' }}>Loading transmission logs...</div>;

    // Calculate a quick win rate
    const wins = history.filter(game => game.outcome === 'won').length;
    const winRate = history.length > 0 ? Math.round((wins / history.length) * 100) : 0;

    return (
        <div style={{ maxWidth: '800px', margin: '40px auto', fontFamily: 'sans-serif' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2>Commander {loggedInUser.username}'s Service Record</h2>
                <Link to="/" style={{ padding: '8px 16px', backgroundColor: '#28a745', color: 'white', textDecoration: 'none', borderRadius: '4px' }}>
                    Deploy to Battle (Play)
                </Link>
            </div>

            <div style={{ backgroundColor: '#f8f9fa', padding: '15px', borderRadius: '8px', marginBottom: '20px' }}>
                <strong>Total Missions:</strong> {history.length} | <strong>Win Rate:</strong> {winRate}%
            </div>

            {history.length === 0 ? (
                <p>No service records found. Time to deploy!</p>
            ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                        <tr style={{ backgroundColor: '#333', color: 'white' }}>
                            <th style={{ padding: '10px' }}>Mission ID</th>
                            <th style={{ padding: '10px' }}>Difficulty</th>
                            <th style={{ padding: '10px' }}>Outcome</th>
                            <th style={{ padding: '10px' }}>Tournament</th>
                        </tr>
                    </thead>
                    <tbody>
                        {history.map((match) => (
                            <tr key={match.id} style={{ borderBottom: '1px solid #ddd' }}>
                                <td style={{ padding: '10px' }}>#{match.id}</td>
                                <td style={{ padding: '10px' }}>{match.difficulty}</td>
                                <td style={{ padding: '10px', color: match.outcome === 'won' ? 'green' : 'red', fontWeight: 'bold' }}>
                                    {match.outcome.toUpperCase()}
                                </td>
                                <td style={{ padding: '10px' }}>{match.tournament_code || 'Casual'}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
}