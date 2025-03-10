'use client';
import Image from "next/image";
import Link from "next/link";
import { HiOutlineShoppingBag, HiOutlineUser, HiOutlineMagnifyingGlass, HiOutlineHeart } from "react-icons/hi2";
import { useState, useEffect } from "react";
import logo from "./assets/Frame 1.svg";

const Header = ({ onLoginClick }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className={`
      bg-white
      fixed top-0 left-0 right-0 z-50 
      transition-all duration-300 
      ${isScrolled ? 'shadow-md py-2' : 'py-3'}
      border-b border-gray-100
    `}>
      <div className="container mx-auto flex justify-between items-center px-4 md:px-6">
        {/* Left Section (User Menu) */}
        <div className="flex items-center gap-3 md:gap-4">
          {/* Login Button */}
          <button
            onClick={onLoginClick}
            className="
              flex items-center gap-1.5
              bg-white 
              hover:bg-gray-50
              px-3 
              py-2.5
              rounded-lg
              text-gray-700
              hover:text-[#800020]
              transition-all 
              duration-300 
              group
              border 
              border-gray-200
              hover:border-[#800020]/30
              shadow-sm
              hover:shadow
            "
          >
            <HiOutlineUser 
              size={18} 
              className="group-hover:text-[#800020] transition-colors" 
            />
            <span className="font-medium text-sm hidden sm:inline">
              ورود / ثبت‌نام
            </span>
          </button>
          
          {/* Favorites Button */}
          <Link 
            href="/favorites" 
            className="
              flex items-center 
              text-gray-600
              hover:text-[#800020]
              transition-colors 
              duration-300 
              mx-2
              group
              relative
            "
          >
            <div className="
              p-2
              rounded-full
              hover:bg-[#800020]/5
              transition-colors
            ">
              <HiOutlineHeart 
                size={20} 
                className="group-hover:scale-110 transition-transform" 
              />
            </div>
          </Link>
          
          {/* Cart Button */}
          <Link 
            href="/cart" 
            className="
              relative 
              flex items-center 
              text-gray-600
              hover:text-[#800020]
              transition-colors 
              duration-300 
              group
            "
          >
            <div className="
              relative
              p-2
              rounded-full
              hover:bg-[#800020]/5
              transition-colors
            ">
              <HiOutlineShoppingBag 
                size={22} 
                className="
                  group-hover:scale-110
                  transition-transform
                " 
              />
              <span className="
                absolute 
                -top-1
                -right-1
                bg-[#DC143C] 
                text-white 
                text-xs 
                font-bold 
                rounded-full 
                w-5 
                h-5 
                flex 
                items-center 
                justify-center 
                shadow-sm
                group-hover:animate-pulse
              ">
                2
              </span>
            </div>
          </Link>
        </div>
        
        {/* Search Bar */}
        <div className="relative w-1/2 lg:w-5/12 group">
          <input
            type="text"
            placeholder="جستجوی محصولات..."
            dir="rtl"
            className="
              w-full 
              p-3 
              pl-12 
              pr-4 
              rounded-xl
              bg-gray-50
              border 
              border-gray-200 
              focus:border-[#800020] 
              focus:ring-2
              focus:ring-[#800020]/20 
              focus:outline-none 
              transition-all 
              duration-300 
              shadow-sm 
              hover:shadow
              text-right
              placeholder-gray-400
              text-sm
            "
          />
          <div className="
            absolute 
            left-3 
            top-3 
            text-gray-400
            transition-all 
            duration-300 
            group-hover:text-[#800020]
          ">
            <HiOutlineMagnifyingGlass size={20} />
          </div>
          
          {/* Search Bar Subtle Glow Effect */}
          <div className="
            absolute 
            inset-0 
            -z-10 
            rounded-xl
            blur-sm 
            opacity-0 
            group-hover:opacity-100 
            transition-opacity 
            duration-300
            bg-gradient-to-r 
            from-[#800020]/5 
            to-transparent
          "></div>
        </div>
        
        {/* Logo (Right Side) */}
        <Link href="/" className="relative group overflow-hidden">
          <div className="relative flex items-center">
            <Image 
              src={logo} 
              alt="نیک چرم" 
              width={110} 
              height={55} 
              priority 
              className="
                transition-all 
                duration-500 
                group-hover:scale-105
                object-contain
                h-10 md:h-12
              " 
            />
            
            {/* Logo Hover Effect */}
            <div className="
              absolute 
              -bottom-1 
              left-0 
              w-full 
              h-0.5 
              bg-[#800020] 
              scale-x-0 
              group-hover:scale-x-100 
              transition-transform 
              duration-300
            "></div>
          </div>
        </Link>
      </div>
    </header>
  );
};

export default Header;