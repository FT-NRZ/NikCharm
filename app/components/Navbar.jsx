'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Icon } from '@iconify/react';


export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMenuOpen, setMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isProductMenuOpen, setIsProductMenuOpen] = useState(false);
  const searchRef = useRef(null);

  const menuItems = [
    { title: 'محصولات زنانه', href: '/products?category=1' },
    { title: 'محصولات مردانه', href: '/products?category=2' },
    { title: 'اکسسوری‌ها', href: '/products?category=3' },
  ];

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsSearchOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <nav className="w-full z-50">
      {/* Desktop Navbar */}
      <div className="hidden md:block bg-white shadow-lg ">
        <div className="mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex-shrink-0 relative" ref={searchRef}>
              <div className="flex items-center">
                <AnimatePresence>
                  {isSearchOpen && (
                    <motion.div
                      initial={{ width: 0, opacity: 0 }}
                      animate={{ width: "200px", opacity: 1 }}
                      exit={{ width: 0, opacity: 0 }}
                      className="mr-2"
                    >
                      <input
                        type="text"
                        placeholder="جستجو..."
                        className="w-full p-2 rounded-lg border border-gray-300 focus:outline-none focus:border-cream-100 text-sm"
                        dir="rtl"
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
                <button
                  onClick={() => setIsSearchOpen(!isSearchOpen)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <svg 
                    className="h-5 w-5 text-black hover:text-cream-100"
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" 
                    />
                  </svg>
                </button>
              </div>
            </div>

            <div className="flex-grow flex justify-center" dir='rtl'>
              <div className="flex items-center space-x-8 rtl:space-x-reverse">
                <Link 
                  href="/"
                  className="text-black hover:text-cream-100 px-3 py-2 rounded-md text-lg font-medium transition-colors duration-200"
                >
                  خانه
                </Link>
                
                <div 
                  className="relative"
                  onMouseEnter={() => setIsOpen(true)}
                  onMouseLeave={() => setIsOpen(false)}
                >
                  <Link
                    href="/products"
                    className="text-black hover:text-cream-100 px-3 py-2 rounded-md text-lg font-medium transition-colors duration-200"
                  >
                    محصولات
                  </Link>
                  
                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute right-0 text-right w-48 mt-3 py-2 bg-white rounded-md shadow-xl z-50"
                      >
                        {menuItems.map((item) => (
                          <Link
                            key={item.href}
                            href={item.href} // Navigate to the products page with the category filter
                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-[#8B0000]"
                          >
                            {item.title}
                          </Link>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <Link
                  href="/about"
                  className="text-black hover:text-cream-100 px-3 py-2 rounded-md text-lg font-medium"
                >
                  درباره ما
                </Link>

                <Link
                  href="/contact"
                  className="text-black hover:text-cream-100 px-3 py-2 rounded-md text-lg font-medium"
                >
                  تماس با ما
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
        <div className="flex justify-around items-center h-16" dir="rtl">
          <Link href="/" className="flex flex-col items-center text-gray-600 hover:text-cream-100">
            <Icon icon={"iconamoon:home-thin"} className='text-3xl'/>
            <span className="text-xs">خانه</span>
          </Link>
          
          <Link href="/products" className="flex flex-col items-center text-gray-600 hover:text-cream-100">
            <Icon icon={"ph:bag-light"} className='text-3xl'/>
            <span className="text-xs">محصولات</span>
          </Link>
          
          <Link href="/cart" className="flex flex-col items-center text-gray-600 hover:text-cream-100">
            <Icon icon={"system-uicons:cart"} className='text-3xl'/>
            <span className="text-xs">سبد خرید</span>
          </Link>
          
          <Link href="/profile" className="flex flex-col items-center text-gray-600 hover:text-cream-100">
            <Icon icon={"iconamoon:profile-thin"} className='text-3xl'/>
            <span className="text-xs">پروفایل</span>
          </Link>
        </div>
      </div>
    </nav>
  );
}