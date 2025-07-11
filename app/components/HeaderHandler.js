'use client'

import { usePathname } from "next/navigation";
import Header from "./Header";
import { useAuth } from '../contexts/AuthContext'

export default function HeaderHandler() {
  const pathname = usePathname();
  const showHeader = ['/', '/about', '/contact'].includes(pathname);
  
  if (!showHeader) return null;

  // استفاده امن از useAuth
  let user = null;
  let isAuthenticated = false;
  
  try {
    const authData = useAuth();
    user = authData?.user;
    isAuthenticated = authData?.isAuthenticated || false;
  } catch (error) {
    // اگر AuthProvider موجود نیست، مقادیر پیش‌فرض استفاده می‌شود
    console.warn('AuthProvider not found. Using default values.');
  }
  
  return (
    <div>
      <Header user={user} isAuthenticated={isAuthenticated} />
    </div>
  )
}