'use client';
import './globals.css';
import HeaderHandler from './components/HeaderHandler';
import FooterHandler from './components/FooterHandler';
import { usePathname } from 'next/navigation';

export default function RootLayout({ children }) {
  const pathname = usePathname(); // این خط باید اینجا باشد

  return (
    <html lang="fa" dir="rtl">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
      </head>
      <body>
        <HeaderHandler />
        {children}
        {!pathname?.startsWith('/admin') && <FooterHandler />}
      </body>
    </html>
  );
}