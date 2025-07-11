'use client';
import Image from "next/image";
import Link from "next/link";
import { HiOutlineShoppingBag, HiOutlineUser, HiOutlineMagnifyingGlass, HiOutlineHeart, HiOutlineBars3, HiXMark, HiOutlineHome } from "react-icons/hi2";
import { useState, useEffect, useRef } from "react";
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from "framer-motion";

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProductMenuOpen, setIsProductMenuOpen] = useState(false);
  const [mobileSubmenuOpen, setMobileSubmenuOpen] = useState(null);
  const [activeTab, setActiveTab] = useState('home');
  const [categories, setCategories] = useState([]);
  const router = useRouter();
  const searchRef = useRef(null);
  const mobileMenuRef = useRef(null);
  const [cartCount, setCartCount] = useState(0);

  // دریافت دسته‌بندی‌ها از دیتابیس
  useEffect(() => {
    fetch('/api/categories')
      .then(res => res.json())
      .then(data => setCategories(data.categories || []));
  }, []);


  useEffect(() => {
  // تابع برای خواندن تعداد محصولات سبد خرید از localStorage
  const updateCartCount = () => {
    try {
      const cart = JSON.parse(localStorage.getItem('cart') || '[]');
      // اگر هر آیتم quantity دارد، جمع کن
      const count = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
      setCartCount(count);
    } catch {
      setCartCount(0);
    }
  };

  updateCartCount();

  // هر بار که رویداد storage رخ داد (در تب‌های دیگر)، مقدار را آپدیت کن
  window.addEventListener('storage', updateCartCount);

  // اگر در پروژه‌ات جایی محصول اضافه/حذف می‌شود، بعد از تغییر، این event را dispatch کن:
  // window.dispatchEvent(new Event('storage'));

  return () => window.removeEventListener('storage', updateCartCount);
  }, []);

  const menuItems = [
    { title: 'خانه', href: '/' },
    {
      title: 'محصولات', href: '/products', hasSubmenu: true, submenuItems: categories.map(cat => ({
        title: cat.name,
        href: `/products?category=${cat.id}`
      }))
    },
    { title: 'درباره ما', href: '/about' },
    { title: 'تماس با ما', href: '/contact' },
  ];

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsSearchOpen(false);
      }
      if (mobileMenuRef.current &&
        !mobileMenuRef.current.contains(event.target) &&
        !event.target.closest('[data-menu-toggle]')) {
        setIsMobileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // جلوگیری از اسکرول شدن body زمانی که منوی موبایل باز است
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileMenuOpen]);

  const toggleMobileSubmenu = (index) => {
    setMobileSubmenuOpen(mobileSubmenuOpen === index ? null : index);
  };

  const handleTabClick = (tab) => {
    setActiveTab(tab);
    if (tab === 'menu') {
      setIsMobileMenuOpen(true);
    } else if (tab === 'search') {
      setIsSearchOpen(true);
    }
  };

  return (
    <>
      <header className={`sticky top-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-white/95 shadow-lg py-2 backdrop-blur-sm' : 'bg-[#F2F2F2] py-3 shadow-md'}`}>
        <div className="container mx-auto px-4">
          {/* Desktop Layout */}
          <div className="hidden md:flex items-center justify-between h-12">
            {/* Logo - سمت راست */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="flex-shrink-0"
            >
              <Link href="/">
                <div className="flex items-center hover:opacity-90 transition-opacity">
                  <img
                    src="/Logo.svg"
                    alt="نیک چرم"
                    className="h-12 w-auto object-contain"
                  />
                </div>
              </Link>
            </motion.div>

            {/* Navigation - وسط */}
            <div className="flex-1 flex items-center justify-center max-w-2xl mx-8">
              <nav className="flex items-center gap-8" dir="rtl">
                {menuItems.map((item, idx) => (
                  <div key={item.href} className="relative">
                    {item.hasSubmenu ? (
                      <div
                        className="relative group"
                        onMouseEnter={() => setIsProductMenuOpen(true)}
                        onMouseLeave={() => setIsProductMenuOpen(false)}
                      >
                        <button
                          className="flex items-center text-gray-900 hover:text-gray-700 transition-colors duration-200 font-medium text-sm"
                          onClick={() => {
                            setActiveTab('products');
                            router.push('/products');
                          }}
                          type="button"
                        >
                          {item.title}
                          <svg className="w-4 h-4 mr-1 mt-0.5 transform group-hover:rotate-180 transition-transform" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                        </button>
                        <AnimatePresence>
                          {isProductMenuOpen && (
                            <motion.div
                              initial={{ opacity: 0, scale: 0.95, y: -10 }}
                              animate={{ opacity: 1, scale: 1, y: 0 }}
                              exit={{ opacity: 0, scale: 0.95, y: -10 }}
                              transition={{ duration: 0.15 }}
                              className="absolute right-0 mt-2 py-2 bg-white rounded-xl shadow-lg border border-gray-100 z-50 w-52"
                            >
                              {item.submenuItems.length === 0 ? (
                                <span className="block px-4 py-2 text-gray-400 text-sm">دسته‌بندی‌ای وجود ندارد</span>
                              ) : (
                                item.submenuItems.map((subItem) => (
                                  <Link
                                    key={subItem.href}
                                    href={subItem.href}
                                    className="flex items-center px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-50 hover:text-[#0F2C59] transition-colors"
                                  >
                                    <span className="ml-2 text-[#0F2C59]">•</span>
                                    {subItem.title}
                                  </Link>
                                ))
                              )}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    ) : (
                      <Link
                        href={item.href}
                        className="text-gray-900 hover:text-gray-700 transition-colors duration-200 font-medium text-sm"
                        onClick={() => setActiveTab(item.href === '/' ? 'home' : item.href.replace('/', ''))}
                      >
                        {item.title}
                      </Link>
                    )}
                  </div>
                ))}
              </nav>
            </div>

            {/* Actions - سمت چپ */}
            <div className="flex items-center gap-4 flex-shrink-0">
              {/* Search */}
              <div className="flex items-center gap-2" ref={searchRef}>
                <motion.div
                  animate={{ width: isSearchOpen ? 200 : 0 }}
                  transition={{ type: "spring", stiffness: 200, damping: 20 }}
                  className="overflow-hidden"
                >
                  <input
                    type="text"
                    placeholder="جستجو..."
                    className="w-full pr-3 py-1.5 pl-3 rounded-lg border border-gray-300 focus:border-[#0F2C59] focus:ring-1 focus:ring-[#0F2C59]/30 text-sm placeholder-gray-400"
                    dir="rtl"
                  />
                </motion.div>
                <button
                  onClick={() => setIsSearchOpen(!isSearchOpen)}
                  className="text-gray-900 hover:text-gray-700 transition-colors duration-200 p-1.5 rounded-lg hover:bg-gray-100"
                >
                  <HiOutlineMagnifyingGlass size={20} />
                </button>
              </div>

              {/* Favorites */}
              <Link
                href="/favorites"
                className="text-gray-900 hover:text-gray-700 transition-colors duration-200 p-1.5 rounded-lg hover:bg-gray-100"
              >
                <HiOutlineHeart size={20} />
              </Link>

              {/* Cart */}
              <Link
                href="/cart"
                className="relative text-gray-900 hover:text-gray-700 transition-colors duration-200 p-1.5 rounded-lg hover:bg-gray-100"
              >
                <HiOutlineShoppingBag size={20} />
                <span className="absolute -top-2 -right-2 bg-[#0F2C59] text-white text-xs font-bold rounded-full w-4 h-4 flex items-center justify-center">
                  {cartCount}
                </span>
              </Link>

              {/* User Login */}
              <button
                onClick={() => router.push('/login')}
                className="flex items-center text-gray-900 hover:text-gray-700 transition-all duration-300 px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-gray-100"
              >
                <HiOutlineUser className="ml-1" size={18} />
                <span>ورود</span>
              </button>
            </div>
          </div>

          {/* Mobile Layout */}
          <div className="md:hidden flex items-center justify-between h-12">
            {/* Mobile Left Menu */}
            <div className="flex items-center">
              <button
                data-menu-toggle
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="text-gray-900 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                aria-label="منو"
              >
                <HiOutlineBars3 size={22} />
              </button>
            </div>

            {/* Mobile Center Logo */}
            <div className="flex-1 flex justify-center">
              <Link href="/" className="block">
                <img
                  src="/Logo.svg"
                  alt="نیک چرم"
                  className="h-10 w-auto object-contain"
                />
              </Link>
            </div>

            {/* Mobile Right Actions */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsSearchOpen(!isSearchOpen)}
                className="text-gray-900 hover:text-gray-700 transition-colors p-1.5 rounded-lg"
              >
                <HiOutlineMagnifyingGlass size={20} />
              </button>
              
              <Link href="/cart" className="relative text-gray-900 hover:text-gray-700 transition-colors p-1.5 rounded-lg">
                <HiOutlineShoppingBag size={20} />
                <span className="absolute -top-1 -right-1 bg-[#0F2C59] text-white text-xs font-bold rounded-full w-4 h-4 flex items-center justify-center">
                  2
                </span>
              </Link>
            </div>
          </div>

          {/* Mobile Search Input */}
          <AnimatePresence>
            {isSearchOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="md:hidden mt-3"
              >
                <input
                  type="text"
                  placeholder="جستجو در محصولات..."
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:border-[#0F2C59] focus:ring-1 focus:ring-[#0F2C59]/30 text-sm placeholder-gray-400"
                  dir="rtl"
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Mobile Menu Slide-in Panel */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <>
              {/* Dark overlay */}
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.5 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black z-40"
                onClick={() => setIsMobileMenuOpen(false)}
              />
              
              {/* Slide-in menu panel */}
              <motion.div
                ref={mobileMenuRef}
                initial={{ x: "100%" }}
                animate={{ x: 0 }}
                exit={{ x: "100%" }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="fixed top-0 right-0 w-3/4 max-w-sm h-full bg-white shadow-2xl z-50 overflow-y-auto"
              >
                <div className="p-4 flex justify-between items-center border-b border-gray-100 bg-gradient-to-r from-gray-50 to-gray-100">
                  <div className="flex items-center justify-center flex-grow">
                    <img
                      src="/Logo2.svg"
                      alt="نیک چرم"
                      className="h-10 w-auto object-contain"
                    />
                  </div>
                  <button 
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="p-2 rounded-full text-gray-500 hover:bg-gray-200 hover:text-gray-700 transition-all duration-200 shadow-sm"
                  >
                    <HiXMark size={20} />
                  </button>
                </div>
                
                <div className="px-4 py-5 border-b border-gray-100 bg-gray-50/50">
                  <Link 
                    href="/login"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center justify-center bg-gradient-to-r from-[#0F2C59] to-[#2E4A7D] text-white py-3.5 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                  >
                    <HiOutlineUser size={18} className="ml-2" />
                    <span className="font-medium">ورود</span>
                  </Link>
                </div>

                <nav className="p-4" dir="rtl">
                  <ul className="space-y-1">
                    {menuItems.map((item, index) => (
                      <li key={item.href}>
                        {item.hasSubmenu ? (
                          <div>
                            <button 
                              onClick={() => toggleMobileSubmenu(index)}
                              className="flex items-center justify-between w-full py-3.5 px-4 text-gray-700 hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-100 rounded-xl transition-all duration-200 group"
                            >
                              <div className="flex items-center">
                                <div className="w-2 h-2 bg-[#0F2C59] rounded-full ml-3 opacity-60 group-hover:opacity-100 transition-opacity"></div>
                                <span className="font-medium">{item.title}</span>
                              </div>
                              <svg 
                                className={`w-4 h-4 transition-transform duration-200 text-[#0F2C59] ${mobileSubmenuOpen === index ? 'rotate-180' : ''}`}
                                fill="none" 
                                stroke="currentColor" 
                                viewBox="0 0 24 24"
                              >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                              </svg>
                            </button>
                            <AnimatePresence>
                              {mobileSubmenuOpen === index && (
                                <motion.div
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: "auto", opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                  className="overflow-hidden mr-4 border-r-2 border-gray-100"
                                >
                                  {item.submenuItems.length === 0 ? (
                                    <span className="block px-4 py-2 text-gray-400 text-sm">دسته‌بندی‌ای وجود ندارد</span>
                                  ) : (
                                    item.submenuItems.map((subItem) => (
                                      <Link
                                        key={subItem.href}
                                        href={subItem.href}
                                        onClick={() => setIsMobileMenuOpen(false)}
                                        className="flex items-center py-3 px-6 text-gray-600 hover:text-[#0F2C59] hover:bg-gray-50 transition-all duration-200 group rounded-lg mr-2"
                                      >
                                        <div className="w-1.5 h-1.5 bg-[#0F2C59] rounded-full ml-3 group-hover:scale-125 transition-transform"></div>
                                        <span className="text-sm">{subItem.title}</span>
                                      </Link>
                                    ))
                                  )}
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        ) : (
                          <Link
                            href={item.href}
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="flex items-center py-3.5 px-4 text-gray-700 hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-100 rounded-xl transition-all duration-200 group"
                          >
                            <div className="w-2 h-2 bg-[#0F2C59] rounded-full ml-3 opacity-60 group-hover:opacity-100 transition-opacity"></div>
                            <span className="font-medium">{item.title}</span>
                          </Link>
                        )}
                      </li>
                    ))}
                  </ul>
                </nav>

                {/* Mobile Menu Footer */}
                <div className="p-4 border-t border-gray-200 mt-auto bg-gradient-to-r from-gray-50 to-gray-100">
                  <Link 
                    href="/favorites"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center py-3.5 px-4 text-gray-600 hover:text-[#0F2C59] hover:bg-white transition-all duration-200 rounded-xl group shadow-sm"
                  >
                    <div className="p-2 bg-white rounded-lg shadow-sm group-hover:shadow-md transition-shadow ml-3">
                      <HiOutlineHeart size={18} className="text-[#0F2C59]" />
                    </div>
                    <span className="font-medium">علاقه‌مندی‌ها</span>
                  </Link>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </header>

      {/* Mobile Bottom Navigation Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40 shadow-lg">
        <div className="flex justify-around py-2">
          <Link 
            href="/" 
            className={`flex flex-col items-center text-xs py-2 px-3 ${activeTab === 'home' ? 'text-[#0F2C59]' : 'text-gray-900'}`}
            onClick={() => setActiveTab('home')}
          >
            <HiOutlineHome size={22} />
            <span className="mt-1">خانه</span>
          </Link>
          
          <Link
            href="/products"
            className={`flex flex-col items-center text-xs py-2 px-3 ${activeTab === 'products' ? 'text-[#0F2C59]' : 'text-gray-900'}`}
            onClick={() => setActiveTab('products')}
          >
            <HiOutlineShoppingBag size={22} />
            <span className="mt-1">محصولات</span>
          </Link>
          
          <Link 
            href="/cart" 
            className={`flex flex-col items-center text-xs py-2 px-3 ${activeTab === 'cart' ? 'text-[#0F2C59]' : 'text-gray-900'} relative`}
            onClick={() => setActiveTab('cart')}
          >
            <div className="relative">
              <HiOutlineShoppingBag size={22} />
              <span className="absolute -top-2 -right-2 bg-[#0F2C59] text-white text-xs font-bold rounded-full w-4 h-4 flex items-center justify-center">
                {cartCount}
              </span>
            </div>
            <span className="mt-1">سبد خرید</span>
          </Link>
          
          <Link 
            href="/login" 
            className={`flex flex-col items-center text-xs py-2 px-3 ${activeTab === 'profile' ? 'text-[#0F2C59]' : 'text-gray-500'}`}
            onClick={() => setActiveTab('profile')}
          >
            <HiOutlineUser size={22} />
            <span className="mt-1">ورود</span>
          </Link>
        </div>
      </div>

      {/* Add bottom padding for mobile to prevent content from being hidden behind the navbar */}
      <div className="md:hidden h-16"></div>
    </>
  );
};

export default Header;