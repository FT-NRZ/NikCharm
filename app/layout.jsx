// app/layout.js
import './globals.css';
import HeaderHandler from './components/HeaderHandler';

export default function RootLayout({ children }) {
  return (
    <html lang="fa">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
      </head>
      <body>
        <HeaderHandler />
        {children}
      </body>
    </html>
  );
}