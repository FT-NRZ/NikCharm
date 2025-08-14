'use client';
import FeaturedSlider from './components/sliders/FeaturedSlider';
import ProductCard from './components/cards/ProductCard';
import CategoriesCircle from './components/cards/categoriesCircle';
import ProductOff from './components/cards/productOff';
import { useRef, useEffect, useCallback, useState } from 'react';
import ProductOffSlider from './components/cards/ProductOffSlider';
import ProductSlider from './components/cards/ProductSlider';

function throttle(func, limit) {
  let lastFunc;
  let lastRan;
  return function () {
    const context = this;
    const args = arguments;
    if (!lastRan) {
      func.apply(context, args);
      lastRan = Date.now();
    } else {
      clearTimeout(lastFunc);
      lastFunc = setTimeout(function () {
        if (Date.now() - lastRan >= limit) {
          func.apply(context, args);
          lastRan = Date.now();
        }
      }, limit - (Date.now() - lastRan));
    }
  };
}

export default function Home() {
  const [products, setProducts] = useState([]);
  const mainProductsRef = useRef(null);
  const discountProductsRef = useRef(null);
  const lastScrollY = useRef(0);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [categories, setCategories] = useState([]);

  
useEffect(() => {
  fetch('/api/categories')
    .then(res => res.json())
    .then(data => setCategories(data.categories || []));
}, []);

useEffect(() => {
  fetch('/api/products')
    .then(res => res.json())
    .then(data => {
      setProducts(data.products || []);
    });
}, [categories]);

  // محصولات تخفیف‌دار
  const discountedProducts = products?.filter(
    p => (p.discount > 0 || p.discountPercent > 0)
  ) || [];

  useEffect(() => {
    const handleScrollProgress = () => {
      const scrollTop = window.pageYOffset;
      const windowHeight = window.innerHeight;
      const docHeight = document.documentElement.scrollHeight;
      const totalScroll = docHeight - windowHeight;
      const progress = (scrollTop / totalScroll) * 100;
      setScrollProgress(progress);
    };

    window.addEventListener('scroll', handleScrollProgress);
    return () => window.removeEventListener('scroll', handleScrollProgress);
  }, []);

  const handleScroll = useCallback(
    throttle(() => {
      const currentScrollY = window.scrollY;
      const scrollDirection = currentScrollY > lastScrollY.current ? 'down' : 'up';

      // اسکرول معکوس برای بخش‌های مختلف
      if (discountProductsRef.current) {
        discountProductsRef.current.scrollLeft += scrollDirection === 'down' ? 100 : -100;
      }
      if (mainProductsRef.current) {
        mainProductsRef.current.scrollLeft += scrollDirection === 'down' ? -100 : 100;
      }

      lastScrollY.current = currentScrollY;
    }, 100),
    []
  );

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  const manualScroll = (container, direction) => {
    if (!container.current) return;
    const scrollAmount = direction === 'right' ? 300 : -300;
    container.current.scrollTo({
      left: container.current.scrollLeft + scrollAmount,
      behavior: 'smooth'
    });
  };

  const [sliderImages, setSliderImages] = useState([]);
    useEffect(() => {
      fetch("/api/slider")
        .then((res) => res.json())
        .then((data) => {
          setSliderImages(data.sliderImages || []);
        });
    }, []);

  return (
    <main className="mx-auto bg-white pb-16">
      {/* Sticky Progress Bar */}
      <div 
        className="h-0.5 bg-red-800 mx-auto transition-all duration-300 ease-out max-w-[100%] sticky top-0 z-30"
        style={{ 
          width: `${scrollProgress * 0.8}%`,
          maxWidth: '100%'
        }}
      />

      {/* Featured Slider */}
      <div className=" mb-10 mt-1">
        <FeaturedSlider sliderImages={sliderImages} />
      </div>
      {/* Categories Section */}
      <div className="w-full">
        <div className="mb-4">
          <CategoriesCircle categories={categories} />
        </div>
      </div>
      
      {/* Discounted Products - حرکت به راست با اسکرول پایین */}
      <div className="mb-12 px-4 bg-gray-100 rounded-xl m-4">
        <div className="relative mx-auto max-w-screen-2xl group">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 pt-6 text-right">محصولات تخفیف‌دار</h2>
          {isMobile ? (
            <ProductOffSlider products={discountedProducts} />
          ) : (
            <>
              <div
                ref={discountProductsRef}
                className="flex overflow-x-auto gap-4 pb-4 scroll-smooth"
                style={{ direction: 'ltr', scrollbarWidth: 'none' }}
              >
                {discountedProducts.map(product => (
                  <ProductOff
                    key={product.id}
                    product={product}
                    className="flex-shrink-0 mr-4 w-72"
                  />
                ))}
              </div>
              {/* جای arrow ها اینجا عوض شد */}
              <div className="absolute top-1/2 left-0 transform -translate-y-1/2 flex justify-between w-full px-4">
                <button
                  onClick={() => manualScroll(discountProductsRef, 'right')}
                  className="bg-white/80 hover:bg-white backdrop-blur-sm transition-all duration-300 
                  text-gray-700 p-3 rounded-full shadow-lg hover:shadow-xl hover:scale-105
                  w-12 h-12 flex items-center justify-center border border-gray-100"
                >
                  →
                </button>
                <button
                  onClick={() => manualScroll(discountProductsRef, 'left')}
                  className="bg-white/80 hover:bg-white backdrop-blur-sm transition-all duration-300 
                  text-gray-700 p-3 rounded-full shadow-lg hover:shadow-xl hover:scale-105
                  w-12 h-12 flex items-center justify-center border border-gray-100"
                >
                  ←
                </button>
              </div>
            </>
          )}
        </div>
      </div>
      {/* بخش ویژگی‌ها - ورژن انیمیشنی */}
      <div className="my-16 mx-4 relative overflow-hidden">
        {/* پس‌زمینه انیمیشنی */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-blue-50 opacity-60"></div>
        
        {/* حباب‌های شناور */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-10 left-10 w-20 h-20 bg-blue-200 rounded-full opacity-20 animate-bounce" style={{animationDelay: '0s', animationDuration: '3s'}}></div>
          <div className="absolute top-32 right-20 w-16 h-16 bg-purple-200 rounded-full opacity-20 animate-bounce" style={{animationDelay: '1s', animationDuration: '4s'}}></div>
          <div className="absolute bottom-20 left-32 w-12 h-12 bg-blue-300 rounded-full opacity-20 animate-bounce" style={{animationDelay: '2s', animationDuration: '3.5s'}}></div>
          <div className="absolute bottom-32 right-10 w-24 h-24 bg-indigo-200 rounded-full opacity-20 animate-bounce" style={{animationDelay: '0.5s', animationDuration: '4.5s'}}></div>
        </div>

        {/* محتوای اصلی */}
        <div className="relative z-10 bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-white/20">
          {/* عنوان با انیمیشن */}
          <div className="text-center mb-12">
            <div className="inline-block">
              <h3 className="text-3xl font-bold bg-gradient-to-r from-[#0F2C59] to-[#2E4A7D] bg-clip-text text-transparent mb-4 animate-pulse">
                چرا نیک چرم؟
              </h3>
              <div className="h-1 bg-gradient-to-r from-[#0F2C59] to-[#2E4A7D] rounded-full w-20 mx-auto animate-pulse"></div>
            </div>
            <p className="text-gray-600 mt-4 text-lg">بهترین انتخاب برای خرید محصولات چرمی</p>
          </div>
          
          <div className="grid md:grid-cols-4 gap-8">
            {/* کارت 1 */}
            <div className="group bg-white rounded-2xl p-6 shadow-lg text-center hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 hover:scale-105 border-2 border-transparent hover:border-[#0F2C59]/20">
              <div className="w-20 h-20 bg-gradient-to-br from-[#0F2C59] to-[#2E4A7D] rounded-full flex items-center justify-center mx-auto mb-6 group-hover:rotate-12 transition-transform duration-500 shadow-lg">
                <svg className="w-10 h-10 text-white group-hover:scale-110 transition-transform duration-300" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <h4 className="font-bold text-gray-800 mb-3 text-lg group-hover:text-[#0F2C59] transition-colors">گارانتی اصالت</h4>
              <p className="text-sm text-gray-600 leading-relaxed">تضمین اصالت تمام محصولات</p>
              <div className="mt-4 h-1 bg-gradient-to-r from-[#0F2C59] to-[#2E4A7D] rounded-full w-0 group-hover:w-full transition-all duration-500 mx-auto"></div>
            </div>
            
            {/* کارت 2 */}
            <div className="group bg-white rounded-2xl p-6 shadow-lg text-center hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 hover:scale-105 border-2 border-transparent hover:border-[#0F2C59]/20" style={{animationDelay: '0.1s'}}>
              <div className="w-20 h-20 bg-gradient-to-br from-[#0F2C59] to-[#2E4A7D] rounded-full flex items-center justify-center mx-auto mb-6 group-hover:rotate-12 transition-transform duration-500 shadow-lg">
                <svg className="w-10 h-10 text-white group-hover:scale-110 transition-transform duration-300" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
                </svg>
              </div>
              <h4 className="font-bold text-gray-800 mb-3 text-lg group-hover:text-[#0F2C59] transition-colors">ارسال سریع</h4>
              <p className="text-sm text-gray-600 leading-relaxed">ارسال در کمترین زمان</p>
              <div className="mt-4 h-1 bg-gradient-to-r from-[#0F2C59] to-[#2E4A7D] rounded-full w-0 group-hover:w-full transition-all duration-500 mx-auto"></div>
            </div>
            
            {/* کارت 3 */}
            <div className="group bg-white rounded-2xl p-6 shadow-lg text-center hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 hover:scale-105 border-2 border-transparent hover:border-[#0F2C59]/20" style={{animationDelay: '0.2s'}}>
              <div className="w-20 h-20 bg-gradient-to-br from-[#0F2C59] to-[#2E4A7D] rounded-full flex items-center justify-center mx-auto mb-6 group-hover:rotate-12 transition-transform duration-500 shadow-lg">
                <svg className="w-10 h-10 text-white group-hover:scale-110 transition-transform duration-300" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z" clipRule="evenodd" />
                </svg>
              </div>
              <h4 className="font-bold text-gray-800 mb-3 text-lg group-hover:text-[#0F2C59] transition-colors">پشتیبانی ۲۴/۷</h4>
              <p className="text-sm text-gray-600 leading-relaxed">همیشه در کنار شما</p>
              <div className="mt-4 h-1 bg-gradient-to-r from-[#0F2C59] to-[#2E4A7D] rounded-full w-0 group-hover:w-full transition-all duration-500 mx-auto"></div>
            </div>
            
            {/* کارت 4 */}
            <div className="group bg-white rounded-2xl p-6 shadow-lg text-center hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 hover:scale-105 border-2 border-transparent hover:border-[#0F2C59]/20" style={{animationDelay: '0.3s'}}>
              <div className="w-20 h-20 bg-gradient-to-br from-[#0F2C59] to-[#2E4A7D] rounded-full flex items-center justify-center mx-auto mb-6 group-hover:rotate-12 transition-transform duration-500 shadow-lg">
                <svg className="w-10 h-10 text-white group-hover:scale-110 transition-transform duration-300" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                </svg>
              </div>
              <h4 className="font-bold text-gray-800 mb-3 text-lg group-hover:text-[#0F2C59] transition-colors">پرداخت امن</h4>
              <p className="text-sm text-gray-600 leading-relaxed">درگاه امن پرداخت</p>
              <div className="mt-4 h-1 bg-gradient-to-r from-[#0F2C59] to-[#2E4A7D] rounded-full w-0 group-hover:w-full transition-all duration-500 mx-auto"></div>
            </div>
          </div>
        </div>
      </div>

      {/* All Products - حرکت به چپ با اسکرول پایین */}
      <div className="relative  px-4 group bg-gray-100 rounded-xl m-4">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 pt-6 text-right">همه محصولات</h2>
        {isMobile ? (
          <ProductSlider products={products} />
        ) : (
          <>
            <div
              ref={mainProductsRef}
              className="flex overflow-x-auto gap-4 pb-4 scroll-smooth"
              style={{ direction: 'rtl', scrollbarWidth: 'none' }}
            >
              {products
                .filter(product => product.stock_quantity > 0)
                .map(product => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    className="flex-shrink-0 ml-4 w-72"
                  />
                ))}
            </div>
            {/* جای arrow ها اینجا عوض شد */}
            <div className="absolute top-1/2 left-4 transform -translate-y-1/2 flex justify-between w-full px-4">
              <button
                onClick={() => manualScroll(mainProductsRef, 'right')}
                className="bg-white/80 hover:bg-white backdrop-blur-sm transition-all duration-300 
                          text-gray-700 p-3 rounded-full shadow-lg hover:shadow-xl hover:scale-105
                          w-12 h-12 flex items-center justify-center border border-gray-100"
              >
                →
              </button>
              <button
                onClick={() => manualScroll(mainProductsRef, 'left')}
                className="bg-white/80 hover:bg-white backdrop-blur-sm transition-all duration-300 
                          text-gray-700 p-3 rounded-full shadow-lg hover:shadow-xl hover:scale-105
                          w-12 h-12 flex items-center justify-center border border-gray-100 mr-5"
              >
                ←
              </button>
            </div>
          </>
        )}
      </div>
      
    </main>
  );
}