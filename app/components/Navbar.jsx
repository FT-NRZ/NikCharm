'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { HiChevronDown } from "react-icons/hi2";
import { HiHome, HiShoppingBag, HiPhone, HiInformationCircle } from "react-icons/hi";

export default function Navbar() {
  const [activeItem, setActiveItem] = useState(null);
  const [isScrolled, setIsScrolled] = useState(false);
  
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 30); // آستانه کمتر برای تغییر حالت
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const menuItems = {
    categories: [
      { name: 'کیف زنانه', href: '/categories/women-bags', 
        submenu: [
          { name: 'کیف دستی', href: '/categories/women-bags/handbags' },
          { name: 'کیف دوشی', href: '/categories/women-bags/shoulder-bags' },
          { name: 'کیف پول', href: '/categories/women-bags/wallets' },
        ] 
      },
      { name: 'کیف مردانه', href: '/categories/men-bags',
        submenu: [
          { name: 'کیف اداری', href: '/categories/men-bags/briefcases' },
          { name: 'کیف دوشی', href: '/categories/men-bags/messenger-bags' },
          { name: 'کیف پول', href: '/categories/men-bags/wallets' },
        ]
      },
      { name: 'اکسسوری', href: '/categories/accessories',
        submenu: [
          { name: 'کمربند', href: '/categories/accessories/belts' },
          { name: 'جاکلیدی', href: '/categories/accessories/keychains' },
          { name: 'دستبند چرم', href: '/categories/accessories/bracelets' },
        ]
      },
    ],
  };

  const handleMouseEnter = (item) => {
    setActiveItem(item);
  };

  const handleMouseLeave = () => {
    setActiveItem(null);
  };

  return (
    <nav 
      className={`
        sticky top-0 
        w-full 
        z-50 
        transition-all 
        duration-300
        ${isScrolled 
          ? 'bg-white/90 shadow-md py-1'
          : 'bg-[#780C28] py-2'
        }
      `}
    >

      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center" dir="rtl">
          {/* لوگو */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
            
            </Link>
          </div>

          {/* منوی اصلی */}
          <ul className="flex items-center space-x-1 space-x-reverse">
            <li>
              <Link 
                href="/" 
                className={`flex items-center px-3 py-1 text-sm font-medium transition-colors duration-200 rounded-md
                  ${isScrolled ? 'text-gray-800 hover:text-[#8a2020]' : 'text-gray-100 hover:text-amber-300'}
                `}
              >
                <HiHome className="ml-1 w-4 h-4" />
                <span>صفحه اصلی</span>
              </Link>
            </li>
            
            <li 
              className="relative" 
              onMouseEnter={() => handleMouseEnter('categories')} 
              onMouseLeave={handleMouseLeave}
            >
              <Link 
                href="/categories" 
                className={`flex items-center px-3 py-1 text-sm font-medium transition-colors duration-200 rounded-md
                  ${isScrolled ? 'text-gray-800 hover:text-[#8a2020]' : 'text-gray-100 hover:text-amber-300'}
                `}
              >
                <HiShoppingBag className="ml-1 w-4 h-4" />
                <span>دسته‌بندی محصولات</span>
                <HiChevronDown 
                  className={`mr-1 w-3 h-3 transition-transform duration-200 ${activeItem === 'categories' ? 'rotate-180' : 'rotate-0'}`} 
                />
              </Link>

              {activeItem === 'categories' && (
                <motion.div 
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 5 }}
                  transition={{ duration: 0.2 }}
                  className="absolute right-0 mt-1 w-48 bg-white/95 rounded-md shadow-lg py-1 z-50 border-t-2 border-amber-400"
                >
                  {menuItems.categories.map((category, idx) => (
                    <div key={category.href} className="relative group/submenu">
                      <Link 
                        href={category.href} 
                        className="block px-4 py-2 text-right text-sm text-gray-700 hover:bg-gradient-to-l hover:from-amber-50 hover:to-white hover:text-[#8a2020] transition-colors duration-150 font-medium"
                        onMouseEnter={() => handleMouseEnter(`${category.name}-submenu`)}
                      >
                        {category.name}
                        {category.submenu && <span className="float-left text-gray-400">›</span>}
                      </Link>
                      
                      {category.submenu && activeItem === `${category.name}-submenu` && (
                        <motion.div 
                          initial={{ opacity: 0, x: -5 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.2 }}
                          className="absolute right-full top-0 w-44 bg-white/95 rounded-md shadow-lg py-1 mr-1 border-r-2 border-amber-400"
                          onMouseLeave={() => handleMouseEnter('categories')}
                        >
                          {category.submenu.map((subitem) => (
                            <Link 
                              key={subitem.href} 
                              href={subitem.href} 
                              className="block px-4 py-2 text-right text-sm text-gray-700 hover:bg-gradient-to-l hover:from-amber-50 hover:to-white hover:text-[#8a2020] transition-colors duration-150"
                            >
                              {subitem.name}
                            </Link>
                          ))}
                        </motion.div>
                      )}
                    </div>
                  ))}
                </motion.div>
              )}
            </li>

            <li>
              <Link 
                href="/contact" 
                className={`flex items-center px-3 py-1 text-sm font-medium transition-colors duration-200 rounded-md
                  ${isScrolled ? 'text-gray-800 hover:text-[#8a2020]' : 'text-gray-100 hover:text-amber-300'}
                `}
              >
                <HiPhone className="ml-1 w-4 h-4" />
                <span>تماس با ما</span>
              </Link>
            </li>
            
            <li>
              <Link 
                href="/about" 
                className={`flex items-center px-3 py-1 text-sm font-medium transition-colors duration-200 rounded-md
                  ${isScrolled ? 'text-gray-800 hover:text-[#8a2020]' : 'text-gray-100 hover:text-amber-300'}
                `}
              >
                <HiInformationCircle className="ml-1 w-4 h-4" />
                <span>درباره ما</span>
              </Link>
            </li>
          </ul>

          {/* جستجو و سبد خرید */}
          <div className="flex items-center space-x-4 space-x-reverse">
            <button className={`p-1 rounded-full transition-colors duration-200 ${isScrolled ? 'text-gray-700 hover:text-[#8a2020]' : 'text-gray-200 hover:text-amber-300'}`}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
            <button className={`p-1 rounded-full transition-colors duration-200 ${isScrolled ? 'text-gray-700 hover:text-[#8a2020]' : 'text-gray-200 hover:text-amber-300'}`}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}