"use client";

import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext'

import {
  ChevronDownIcon,
  UserIcon,
  Cog6ToothIcon,
  ArrowLeftOnRectangleIcon,
  ShoppingBagIcon
} from '@heroicons/react/24/outline';

const UserProfile = () => {
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // بستن dropdown با کلیک خارج از آن
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!user) return null;

  const menuItems = [
    {
      icon: UserIcon,
      label: 'پروفایل من',
      href: '/profile',
      action: () => setIsOpen(false),
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      icon: ShoppingBagIcon,
      label: 'سفارشات من',
      href: '/orders',
      action: () => setIsOpen(false),
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      icon: Cog6ToothIcon,
      label: 'تنظیمات',
      href: '/settings',
      action: () => setIsOpen(false),
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    },
    {
      icon: ArrowLeftOnRectangleIcon,
      label: 'خروج',
      action: logout,
      className: 'text-red-600 hover:text-red-700 hover:bg-red-50',
      color: 'text-red-600',
      bgColor: 'bg-red-50'
    }
  ];

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Profile Button - طراحی مدرن و جذاب */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="group relative flex items-center space-x-2 space-x-reverse hover:bg-gray-50 rounded-lg px-2 py-1.5 transition-all duration-300 ease-in-out"
      >
        {/* آواتار با افکت درخشان */}
        <div className="relative">
          <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-full flex items-center justify-center shadow-md group-hover:shadow-lg transition-all duration-300">
            <UserIcon className="w-4 h-4 text-white" />
          </div>
          <div className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-green-400 rounded-full border-2 border-white shadow-sm animate-pulse"></div>
        </div>
        
        {/* اطلاعات کاربر */}
        <div className="hidden md:block text-right min-w-0">
          <p className="text-sm font-medium text-gray-900 truncate group-hover:text-indigo-600 transition-colors duration-200">
            {user.fullName || user.username}
          </p>
          <p className="text-xs text-gray-500 truncate">
            {user.role === 'admin' ? 'مدیر' : 'مشتری'}
          </p>
        </div>
        
        {/* آیکون فلش */}
        <ChevronDownIcon
          className={`w-4 h-4 text-gray-400 transition-all duration-300 group-hover:text-indigo-500 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {/* Dropdown Menu - طراحی مدرن با گلاس مورفیسم */}
      {isOpen && (
        <div className="absolute left-0 mt-2 w-80 md:w-64 bg-white/95 backdrop-blur-lg border border-gray-200/50 rounded-xl shadow-2xl z-50 overflow-hidden animate-in slide-in-from-top-2 duration-200">
          {/* User Info Header */}
          <div className="relative px-4 py-4 bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 border-b border-gray-100/50">
            <div className="flex items-start space-x-3 space-x-reverse">
              <div className="relative flex-shrink-0">
                <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-full flex items-center justify-center shadow-lg">
                  <UserIcon className="w-6 h-6 text-white" />
                </div>
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white shadow-sm"></div>
              </div>
              <div className="flex-1 min-w-0 text-right">
                <p className="text-base font-bold text-gray-900 leading-tight mb-1">
                  {user.fullName || user.username}
                </p>
                <p className="text-sm text-gray-600 leading-tight mb-2 break-all">{user.email}</p>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                  {user.role === 'admin' ? 'مدیر سیستم' : 'مشتری'}
                </span>
              </div>
            </div>
          </div>

          {/* Menu Items */}
          <div className="py-2">
            {menuItems.map((item, index) => {
              const Icon = item.icon;

              if (item.href) {
                return (
                  <a
                    key={index}
                    href={item.href}
                    onClick={item.action}
                    className={`group flex items-center space-x-3 space-x-reverse px-4 py-3 text-sm font-medium transition-all duration-200 hover:bg-gray-50/80 hover:translate-x-1 ${item.className || 'text-gray-700 hover:text-gray-900'}`}
                  >
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${item.bgColor || 'bg-gray-100'} group-hover:scale-110 transition-transform duration-200`}>
                      <Icon className={`w-4 h-4 ${item.color || 'text-gray-600'}`} />
                    </div>
                    <span className="flex-1 text-right">{item.label}</span>
                    <ChevronDownIcon className="w-4 h-4 -rotate-90 text-gray-400 opacity-0 group-hover:opacity-100 transition-all duration-200 flex-shrink-0" />
                  </a>
                );
              }

              return (
                <button
                  key={index}
                  onClick={item.action}
                  className={`group w-full flex items-center space-x-3 space-x-reverse px-4 py-3 text-sm font-medium transition-all duration-200 hover:bg-gray-50/80 hover:translate-x-1 ${item.className || 'text-gray-700 hover:text-gray-900'}`}
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${item.bgColor || 'bg-gray-100'} group-hover:scale-110 transition-transform duration-200`}>
                    <Icon className={`w-4 h-4 ${item.color || 'text-gray-600'}`} />
                  </div>
                  <span className="flex-1 text-right">{item.label}</span>
                  <ChevronDownIcon className="w-4 h-4 -rotate-90 text-gray-400 opacity-0 group-hover:opacity-100 transition-all duration-200 flex-shrink-0" />
                </button>
              );
            })}
          </div>
          
          {/* Footer Decoration */}
          <div className="h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>
        </div>
      )}
    </div>
  );
};

export default UserProfile;