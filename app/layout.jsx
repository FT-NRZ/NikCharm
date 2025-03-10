'use client';

import './globals.css';
import { useState } from 'react';
import Header from './components/Header';
import Navbar from './components/Navbar';
import LoginSignup from './components/Login';

export default function RootLayout({ children }) {
  const [showLogin, setShowLogin] = useState(false);

  const toggleLogin = () => {
    setShowLogin(!showLogin);
  };

  return (
    <html lang="fa">
      <body>
        <Header onLoginClick={toggleLogin} />
        {showLogin && <LoginSignup />}
        {children}
        <Navbar />
      </body>
    </html>
  );
}