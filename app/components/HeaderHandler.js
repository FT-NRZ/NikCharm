'use client'

import { usePathname } from "next/navigation";
import Header from "./Header";
import { useAuth } from '../contexts/AuthContext'

export default function HeaderHandler() {
  const pathname = usePathname();
  
  // ✅ Hooks همیشه در بالای کامپوننت فراخوانی می‌شوند
  const authData = useAuth();
  
  // بررسی شرطی بعد از فراخوانی hook
  const showHeader = ['/', '/about', '/contact'].includes(pathname);
  
  if (!showHeader) return null;

  // استخراج امن داده‌ها
  const user = authData?.user || null;
  const isAuthenticated = authData?.isAuthenticated || false;
  
  return (
    <div>
      <Header user={user} isAuthenticated={isAuthenticated} />
    </div>
  )
}