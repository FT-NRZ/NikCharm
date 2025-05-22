'use client';

import React from 'react';
import Link from 'next/link';
import { 
  HiOutlineEnvelope, 
  HiOutlinePhone, 
  HiOutlineMapPin,
  HiOutlineGlobeAlt,
  HiArrowRight
} from 'react-icons/hi2';
import { 
  FaInstagram, 
  FaTelegram, 
  FaWhatsapp,
  FaCopyright
} from 'react-icons/fa';

const Footer = () => {
  return (
    <footer 
      className="bg-[#F2F2F2] py-12 border-t-4 border-[#0F2C59]"
      style={{ fontFamily: 'Vazirmatn, system-ui, sans-serif', direction: 'rtl' }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main footer content */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Column 1: About */}
          <div className="md:pr-6">
            <h3 className="text-lg font-bold text-[#0F2C59] mb-6 border-r-4 border-[#0F2C59] pr-3 py-1">درباره ما</h3>
            <div>
              <p className="text-gray-600 text-sm leading-relaxed mb-6">
                ما با بیش از ۱۵ سال تجربه در تولید محصولات چرمی دست‌دوز با کیفیت، همواره به دنبال جلب رضایت مشتریان خود هستیم. تمامی محصولات ما با استفاده از بهترین مواد اولیه و توسط هنرمندان ماهر تولید می‌شوند.
              </p>
              
              <div className="flex items-center gap-4">
                <Link href="https://instagram.com" className="w-10 h-10 rounded-full bg-white text-[#0F2C59] border-2 border-[#0F2C59] flex items-center justify-center transition-all duration-300 hover:bg-[#0F2C59] hover:text-white">
                  <FaInstagram className="text-lg" />
                </Link>
                <Link href="https://t.me" className="w-10 h-10 rounded-full bg-white text-[#0F2C59] border-2 border-[#0F2C59] flex items-center justify-center transition-all duration-300 hover:bg-[#0F2C59] hover:text-white">
                  <FaTelegram className="text-lg" />
                </Link>
                <Link href="https://whatsapp.com" className="w-10 h-10 rounded-full bg-white text-[#0F2C59] border-2 border-[#0F2C59] flex items-center justify-center transition-all duration-300 hover:bg-[#0F2C59] hover:text-white">
                  <FaWhatsapp className="text-lg" />
                </Link>
              </div>
            </div>
          </div>
          
          {/* Column 2: Quick Links */}
          <div className="md:px-6">
            <h3 className="text-lg font-bold text-[#0F2C59] mb-6 border-r-4 border-[#0F2C59] pr-3 py-1">دسترسی سریع</h3>
            <ul className="space-y-4">
              {[
                { title: 'صفحه اصلی', href: '/' },
                { title: 'محصولات', href: '/products' },
                { title: 'درباره ما', href: '/about' },
                { title: 'تماس با ما', href: '/contact' },
              ].map((link, index) => (
                <li key={index}>
                  <Link 
                    href={link.href} 
                    className="text-gray-600 hover:text-[#0F2C59] transition-colors duration-300 flex items-center group"
                  >
                    <span className="opacity-0 group-hover:opacity-100 transform translate-x-2 group-hover:translate-x-0 transition-all duration-300 ml-2 text-[#0F2C59]">
                      <HiArrowRight size={14} />
                    </span>
                    {link.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          
          {/* Column 3: Contact Info */}
          <div className="md:pl-6">
            <h3 className="text-lg font-bold text-[#0F2C59] mb-6 border-r-4 border-[#0F2C59] pr-3 py-1">ارتباط با ما</h3>
            <ul className="space-y-4">
              <li className="flex items-start">
                <HiOutlineMapPin className="text-[#0F2C59] mt-1 ml-3 flex-shrink-0 text-lg" />
                <span className="text-gray-600">بجنورد : پاساژ ارم ، طبقه اول پلاک 84</span>
              </li>
              <li className="flex items-center">
                <HiOutlinePhone className="text-[#0F2C59] ml-3 flex-shrink-0 text-lg" />
                <span className="text-gray-600">09151871449</span>
              </li>
              <li className="flex items-center">
                <HiOutlineEnvelope className="text-[#0F2C59] ml-3 flex-shrink-0 text-lg" />
                <span className="text-gray-600">nike_leather_bj</span>
              </li>
              <li className="flex items-center">
                <HiOutlineGlobeAlt className="text-[#0F2C59] ml-3 flex-shrink-0 text-lg" />
                <span className="text-gray-600">nike_leather3</span>
              </li>
            </ul>
          </div>
        </div>
        
        {/* Bottom footer */}
        <div className="mt-12 pt-6 border-t border-gray-200 flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center text-gray-500 text-sm">
            <FaCopyright className="ml-1" />
            <p>
              {new Date().getFullYear()} فروشگاه محصولات چرمی. تمامی حقوق محفوظ است.
            </p>
          </div>
          
          <div className="mt-4 md:mt-0">
            <ul className="flex items-center space-x-6 space-x-reverse">
              <li>
                <Link href="/terms" className="text-gray-500 hover:text-[#0F2C59] text-sm transition-colors">
                  قوانین و مقررات
                </Link>
              </li>
              <li>
                <Link href="/shipping" className="text-gray-500 hover:text-[#0F2C59] text-sm transition-colors">
                  شرایط ارسال
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;