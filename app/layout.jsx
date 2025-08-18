'use client';
import './globals.css';
import HeaderHandler from './components/HeaderHandler';
import FooterHandler from './components/FooterHandler';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
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
          <ToastContainer
            position="top-right"
            autoClose={5000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            rtl={true}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="colored"
          />
          {!pathname?.startsWith('/admin') && <FooterHandler />}
        </AuthProvider>
      </body>
    </html>
  );
}