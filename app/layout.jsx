// app/layout.js
import './globals.css';
import HeaderHandler from './components/HeaderHandler';
import FooterHandler from './components/FooterHandler';

export default function RootLayout({ children }) {
  return (
    <html lang="fa" dir="rtl">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
      </head>
      <body>
        <HeaderHandler />
        {children}
        <FooterHandler />
      </body>
    </html>
  );
}