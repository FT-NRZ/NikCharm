'use client';

import './globals.css';
import { useState } from 'react';
import Header from './components/Header';
import Navbar from './components/Navbar';
import LoginSignup from './components/Login';
import HomePage from './components/homepage';

export default function RootLayout({ children }) {
  const [showLogin, setShowLogin] = useState(false);

  const toggleLogin = () => {
    setShowLogin(!showLogin);
  };

  return (
    <html lang="fa">
      <body>
        <div>
        <Header onLoginClick={toggleLogin} />
        <Navbar />
        </div>
        {showLogin && <LoginSignup />}
        {children}
        
      </body>
    </html>
  );
}