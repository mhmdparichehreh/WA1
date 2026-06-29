// client/src/Login.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Login({ setLoggedInUser }) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault(); // Prevent the form from refreshing the page
        setErrorMessage('');

        try {
            const response = await fetch('http://localhost:3001/api/sessions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, password }),
                credentials: 'include' // CRITICAL: This allows the session cookie to be saved!
            });

            if (response.ok) {
                const user = await response.json();
                setLoggedInUser(user); // Save the user info to the main App state
                navigate('/'); // Send them to the main game page
            } else {
                setErrorMessage('Invalid username or password. Please try again.');
            }
        } catch (error) {
            setErrorMessage('Could not connect to the server. Is your backend running?');
        }
    };

    return (
        <div style={{ maxWidth: '400px', margin: '50px auto', textAlign: 'center', fontFamily: 'sans-serif' }}>
            <h2>Battleship Login</h2>
            
            {errorMessage && (
                <div style={{ color: 'red', marginBottom: '15px', padding: '10px', border: '1px solid red' }}>
                    {errorMessage}
                </div>
            )}

            <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <input
                    type="text"
                    placeholder="Username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    style={{ padding: '10px', fontSize: '16px' }}
                />
                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    style={{ padding: '10px', fontSize: '16px' }}
                />
                <button type="submit" style={{ padding: '10px', fontSize: '16px', cursor: 'pointer', backgroundColor: '#007BFF', color: 'white', border: 'none' }}>
                    Log In
                </button>
            </form>
            
            <p style={{ marginTop: '20px', fontSize: '14px', color: '#666' }}>
                Test accounts: Alice_Player, Bob_The_Builder, Charlie_Newbie<br/>
                Password for all: password123
            </p>
        </div>
    );
}