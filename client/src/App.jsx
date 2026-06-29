// client/src/App.jsx
import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './Login';
import Navbar from './Navbar';

export default function App() {
    const [loggedInUser, setLoggedInUser] = useState(null);

    return (
        <BrowserRouter>
            <div style={{ margin: 0, padding: 0, fontFamily: 'sans-serif' }}>
                {/* The Navbar sits outside the Routes so it always shows up */}
                <Navbar loggedInUser={loggedInUser} setLoggedInUser={setLoggedInUser} />
                
                <Routes>
                    <Route 
                        path="/" 
                        element={
                            loggedInUser 
                                ? <h2 style={{textAlign: 'center', marginTop: '50px'}}>Welcome to Battleship! (Game Board coming soon)</h2> 
                                : <Navigate to="/login" />
                        } 
                    />
                    
                    <Route 
                        path="/login" 
                        element={<Login setLoggedInUser={setLoggedInUser} />} 
                    />
                </Routes>
            </div>
        </BrowserRouter>
    );
}