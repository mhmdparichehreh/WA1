// client/src/Navbar.jsx
import { useNavigate } from 'react-router-dom';

export default function Navbar({ loggedInUser, setLoggedInUser }) {
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            // Tell the backend to destroy the session
            const response = await fetch('http://localhost:3001/api/sessions/current', {
                method: 'DELETE',
                credentials: 'include' // CRITICAL: This sends the session cookie to be destroyed
            });

            if (response.ok) {
                setLoggedInUser(null); // Clear the user from React's state
                navigate('/login'); // Send them back to the login screen
            } else {
                console.error('Failed to log out on the server.');
            }
        } catch (error) {
            console.error('Network error during logout:', error);
        }
    };

    return (
        <nav style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            padding: '10px 20px', 
            backgroundColor: '#333', 
            color: 'white',
            fontFamily: 'sans-serif'
        }}>
            <h1 style={{ margin: 0, fontSize: '24px' }}>🚢 Battleship</h1>
            
            {loggedInUser && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <span>Playing as: <strong>{loggedInUser.username}</strong></span>
                    <button 
                        onClick={handleLogout}
                        style={{ 
                            padding: '8px 15px', 
                            backgroundColor: '#dc3545', 
                            color: 'white', 
                            border: 'none', 
                            cursor: 'pointer',
                            borderRadius: '4px'
                        }}
                    >
                        Log Out
                    </button>
                </div>
            )}
        </nav>
    );
}