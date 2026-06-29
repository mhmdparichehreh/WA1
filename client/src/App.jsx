// client/src/App.jsx
import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './Login';

export default function App() {
    const [loggedInUser, setLoggedInUser] = useState(null);

    return (
        <BrowserRouter>
            <div>
                {/* We will add a Navigation Bar here later */}
                
                <Routes>
                    {/* The main route: If logged in, show the game. If not, redirect to login */}
                    <Route 
                        path="/" 
                        element={
                            loggedInUser 
                                ? <h2 style={{textAlign: 'center', marginTop: '50px'}}>Welcome to Battleship, {loggedInUser.username}! (Game Board coming soon)</h2> 
                                : <Navigate to="/login" />
                        } 
                    />
                    
                    {/* The login route */}
                    <Route 
                        path="/login" 
                        element={<Login setLoggedInUser={setLoggedInUser} />} 
                    />
                </Routes>
            </div>
        </BrowserRouter>
    );
}