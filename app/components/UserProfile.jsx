"use client";

import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
  ChevronDownIcon,
  UserIcon,
  Squares2X2Icon,
  ArrowLeftOnRectangleIcon,
  ShoppingBagIcon,
} from '@heroicons/react/24/outline';

const UserProfile = () => {
  const { user: authUser, logout } = useAuth();
  const [user, setUser] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const role = user?.role || localStorage.getItem('userRole');
  const isAdmin = role === 'admin';


  const handleLogout = () => {
    // پاک کردن localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userRole');
    
    // اعلان logout
    window.dispatchEvent(new Event('storage'));
    
    // اجرای logout از AuthContext
    if (logout) {
      logout();
    }
    
    // تنظیم state
    setUser(null);
    setIsOpen(false);
    
    // redirect
    window.location.href = '/';
  };

const menuItems = [
  {
    icon: UserIcon,
    label: 'پروفایل من',
    href: '/profile',
    action: () => setIsOpen(false),
    color: 'text-[#0F2C59]',
    bgColor: 'bg-[#0F2C59]/10',
    description: 'مدیریت اطلاعات شخصی'
  },
  {
    icon: ShoppingBagIcon,
    label: 'سفارشات من',
    href: '/orders',
    action: () => setIsOpen(false),
    color: 'text-[#0F2C59]',
    bgColor: 'bg-[#0F2C59]/10',
    description: 'تاریخچه خرید و سفارشات'
  },
  // فقط برای ادمین: داشبورد مدیریت
  ...(isAdmin ? [{
    icon: Squares2X2Icon,
    label: 'داشبورد مدیریت',
    href: '/admin/dashboard',
    action: () => setIsOpen(false),
    color: 'text-[#0F2C59]',
    bgColor: 'bg-[#0F2C59]/10',
    description: 'مدیریت سایت و محصولات'
  }] : []),
  {
    icon: ArrowLeftOnRectangleIcon,
    label: 'خروج از حساب',
    action: handleLogout,
    className: 'text-red-600 hover:text-red-700 hover:bg-red-50/80',
    color: 'text-red-600',
    bgColor: 'bg-red-50',
    description: 'خروج از حساب کاربری'
  }
];

  // ⭐ بارگذاری user
  useEffect(() => {
    const loadUserData = () => {
      // اول از AuthContext
      if (authUser) {
        console.log('👤 Loading user from AuthContext:', authUser);
        setUser(authUser);
        return;
      }

      // سپس از localStorage
      const savedUser = localStorage.getItem('user');
      const isLoggedIn = localStorage.getItem('isLoggedIn');
      
      if (savedUser && isLoggedIn === 'true') {
        try {
          const userData = JSON.parse(savedUser);
          console.log('👤 Loading user from localStorage:', userData);
          setUser(userData);
        } catch (e) {
          console.error('Error parsing user data:', e);
          // پاک کردن داده‌های خراب
          localStorage.removeItem('user');
          localStorage.removeItem('isLoggedIn');
          localStorage.removeItem('token');
          localStorage.removeItem('userRole');
        }
      }
    };

    loadUserData();

    // گوش دادن به تغییرات
    const handleStorageChange = () => {
      console.log('📦 Storage changed, reloading user data');
      loadUserData();
    };

    const handleUserLogin = (event) => {
      console.log('🔐 User login event received:', event.detail);
      setUser(event.detail);
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('userLogin', handleUserLogin);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('userLogin', handleUserLogin);
    };
  }, [authUser]);

  // بستن dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // اگر user نداریم، نشان نده
  if (!user) {
    return null;
  }


  return (
    <div className="relative" ref={dropdownRef} style={{ fontFamily: 'Vazirmatn, system-ui, sans-serif', direction: 'rtl' }}>
      {/* Profile Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="group relative flex items-center space-x-3 bg-white hover:bg-gray-50 rounded-xl px-3 py-2 transition-all duration-300 ease-in-out border border-gray-200 hover:border-[#0F2C59]/30 hover:shadow-lg"
      >
        {/* آواتار */}
        <div className="relative">
          <div className="w-10 h-10 bg-gradient-to-br from-[#0F2C59] to-[#0F2C59]/80 rounded-xl flex items-center justify-center shadow-md group-hover:shadow-lg transition-all duration-300 group-hover:scale-105">
            <UserIcon className="w-5 h-5 text-white" />
          </div>
          <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-white shadow-sm">
            <div className="w-full h-full bg-green-400 rounded-full animate-pulse"></div>
          </div>
        </div>
        
        {/* اطلاعات کاربر */}
        <div className="hidden md:block text-right min-w-0 flex-1">
          <p className="text-sm font-bold text-gray-900 truncate group-hover:text-[#0F2C59] transition-colors duration-300">
            {user.fullName || user.full_name || user.username}
          </p>
          <p className="text-xs text-gray-500 truncate">
            {user.role === 'admin' ? 'مدیر سیستم' : 'کاربر'}
          </p>
        </div>
        
        {/* آیکون فلش */}
        <div className="flex items-center justify-center w-6 h-6 rounded-lg bg-gray-100 group-hover:bg-[#0F2C59]/10 transition-all duration-300">
          <ChevronDownIcon
            className={`w-4 h-4 text-gray-600 group-hover:text-[#0F2C59] transition-all duration-300 ${isOpen ? 'rotate-180' : ''}`}
          />
        </div>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute left-0 mt-3 w-80 bg-white/95 backdrop-blur-xl border border-gray-200/50 rounded-2xl shadow-2xl z-50 overflow-hidden animate-in slide-in-from-top-3 duration-300">
          {/* Header */}
          <div className="relative px-6 py-5 bg-gradient-to-r from-[#0F2C59]/5 to-[#0F2C59]/10 border-b border-gray-100/50">
            <div className="flex items-start space-x-4 ">
              <div className="relative flex-shrink-0">
                <div className="w-14 h-14 bg-gradient-to-br from-[#0F2C59] to-[#0F2C59]/80 rounded-2xl flex items-center justify-center shadow-lg">
                  <UserIcon className="w-7 h-7 text-white" />
                </div>
                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-3 border-white shadow-md">
                  <div className="w-full h-full bg-green-400 rounded-full animate-pulse"></div>
                </div>
              </div>
              <div className="flex-1 min-w-0 text-right">
                <h3 className="text-lg font-bold text-gray-900 leading-tight mb-1">
                  {user.fullName || user.full_name || user.username}
                </h3>
                <p className="text-sm text-gray-600 leading-tight mb-3 break-all">{user.email}</p>
                <div className="flex items-center justify-end">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-[#0F2C59] text-white shadow-sm">
                    <div className="w-2 h-2 bg-white rounded-full ml-2 animate-pulse"></div>
                    {user.role === 'admin' ? 'مدیر سیستم' : 'کاربر فعال'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Menu Items */}
          <div className="py-3">
            {menuItems.map((item, index) => {
              const Icon = item.icon;

              const menuContent = (
                <>
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${item.bgColor || 'bg-gray-100'} group-hover:scale-110 transition-all duration-300`}>
                    <Icon className={`w-5 h-5 ${item.color || 'text-gray-600'}`} />
                  </div>
                  <div className="flex-1 text-right min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-semibold text-gray-900 group-hover:text-[#0F2C59] transition-colors duration-200">
                        {item.label}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 leading-tight">
                      {item.description}
                    </p>
                  </div>
                  <div className="flex items-center justify-center w-6 h-6 rounded-lg bg-gray-100 group-hover:bg-[#0F2C59]/10 transition-all duration-300 opacity-0 group-hover:opacity-100">
                    <ChevronDownIcon className="w-3 h-3 -rotate-90 text-gray-400 group-hover:text-[#0F2C59]" />
                  </div>
                </>
              );

              if (item.href) {
                return (
                  <a
                    key={index}
                    href={item.href}
                    onClick={item.action}
                    className={`group flex items-center space-x-4 space-x-reverse px-6 py-4 text-sm font-medium transition-all duration-300 hover:bg-gray-50/80 hover:translate-x-2 border-l-3 border-transparent hover:border-[#0F2C59] ${item.className || 'text-gray-700 hover:text-gray-900'}`}
                  >
                    {menuContent}
                  </a>
                );
              }

              return (
                <button
                  key={index}
                  onClick={item.action}
                  className={`group w-full flex items-center space-x-4 space-x-reverse px-6 py-4 text-sm font-medium transition-all duration-300 hover:bg-gray-50/80 hover:translate-x-2 border-l-3 border-transparent hover:border-red-500 ${item.className || 'text-gray-700 hover:text-gray-900'}`}
                >
                  {menuContent}
                </button>
              );
            })}
          </div>
          
          {/* Footer */}
          <div className="px-6 py-4 bg-gray-50/50 border-t border-gray-100">
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>آخرین ورود: الان</span>
              <div className="flex items-center space-x-2 space-x-reverse">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span>آنلاین</span>
              </div>
            </div>
          </div>
          
          <div className="h-1 bg-gradient-to-r from-[#0F2C59] via-[#0F2C59]/80 to-[#0F2C59]"></div>
        </div>
      )}
    </div>
  );
};

export default UserProfile;