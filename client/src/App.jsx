// client/src/App.jsx
import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './Login';
import Navbar from './Navbar';
import GameBoard from './GameBoard';
import Dashboard from './Dashboard';

export default function App() {
    const [loggedInUser, setLoggedInUser] = useState(null);

    return (
        <BrowserRouter>
            <div style={{ margin: 0, padding: 0, fontFamily: 'sans-serif' }}>
                <Navbar loggedInUser={loggedInUser} setLoggedInUser={setLoggedInUser} />
                
                <Routes>
			<Route 
                     path="/dashboard" 
                     element={
                         loggedInUser 
                             ? <Dashboard loggedInUser={loggedInUser} />
                             : <Navigate to="/login" /> } 
                 	/>

                    <Route 
                        path="/" 
                        element={
                            loggedInUser 
                                ? <GameBoard loggedInUser={loggedInUser} /> 
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
