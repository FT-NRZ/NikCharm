'use client';
import './globals.css';
import HeaderHandler from './components/HeaderHandler';
import FooterHandler from './components/FooterHandler';
import { usePathname } from 'next/navigation';
import { AuthProvider } from './contexts/AuthContext'; // اضافه کردن AuthProvider

export default function RootLayout({ children }) {
  const pathname = usePathname();

  return (
    <html lang="fa" dir="rtl">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
      </head>
      <body>
        <AuthProvider>
          <HeaderHandler />
          {children}
          {!pathname?.startsWith('/admin') && <FooterHandler />}
        </AuthProvider>
      </body>
    </html>
  );
}