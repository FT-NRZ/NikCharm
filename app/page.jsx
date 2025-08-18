'use client';
import FeaturedSlider from './components/sliders/FeaturedSlider';
import ProductCard from './components/cards/ProductCard';
import CategoriesCircle from './components/cards/categoriesCircle';
import ProductOff from './components/cards/productOff';
import { useRef, useEffect, useCallback, useState } from 'react';
import ProductOffSlider from './components/cards/ProductOffSlider';
import ProductSlider from './components/cards/ProductSlider';
import LoadingModal from './components/LoadingModal'; 

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
  const [isLoading, setIsLoading] = useState(true);
  const [products, setProducts] = useState([]);
  const mainProductsRef = useRef(null);
  const discountProductsRef = useRef(null);
  const lastScrollY = useRef(0);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [categories, setCategories] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  
  // 🔥 تعداد محصولات بر اساس سایز صفحه - کاهش یافته
  const [productsPerPage, setProductsPerPage] = useState(4);
  const [screenSize, setScreenSize] = useState('lg');

  const filteredProducts = products.filter(product => product.stock_quantity > 0);
  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct);
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);

  // 🔥 تشخیص سایز صفحه و تنظیم تعداد محصولات - اصلاح شده برای یک سطر
  useEffect(() => {
    const updateScreenSize = () => {
      const width = window.innerWidth;
      let newProductsPerPage;
      let newScreenSize;
      
      if (width < 640) {
        // Mobile: 1 column - 1 محصول (1 سطر)
        newProductsPerPage = 1;
        newScreenSize = 'sm';
        setIsMobile(true);
      } else if (width < 768) {
        // Small tablet: 2 columns - 2 محصول (1 سطر)
        newProductsPerPage = 2;
        newScreenSize = 'md';
        setIsMobile(true);
      } else if (width < 1024) {
        // Tablet: 2 columns - 2 محصول (1 سطر)
        newProductsPerPage = 2;
        newScreenSize = 'lg';
        setIsMobile(false);
      } else if (width < 1280) {
        // Small desktop: 3 columns - 3 محصول (1 سطر)
        newProductsPerPage = 3;
        newScreenSize = 'xl';
        setIsMobile(false);
      } else if (width < 1536) {
        // Large desktop: 4 columns - 4 محصول (1 سطر)
        newProductsPerPage = 4;
        newScreenSize = '2xl';
        setIsMobile(false);
      } else {
        // Extra large: 4 columns - 4 محصول (1 سطر)
        newProductsPerPage = 4;
        newScreenSize = '3xl';
        setIsMobile(false);
      }
      
      setProductsPerPage(newProductsPerPage);
      setScreenSize(newScreenSize);
      
      // Reset to first page when screen size changes
      setCurrentPage(1);
    };

    updateScreenSize();
    window.addEventListener('resize', updateScreenSize);
    return () => window.removeEventListener('resize', updateScreenSize);
  }, []);

  const paginate = (pageNumber) => {
    setCurrentPage(pageNumber);
    const productsSection = document.getElementById('all-products-section');
    if (productsSection) {
      productsSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  useEffect(() => {
    if (totalPages <= 1) return;
    const interval = setInterval(() => {
      setCurrentPage(prev =>
        prev < totalPages ? prev + 1 : 1
      );
    }, 5000);
    return () => clearInterval(interval);
  }, [totalPages]);

  useEffect(() => {
    if (isLoading) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }

    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 3000);

    return () => {
      clearTimeout(timer);
      document.body.style.overflow = 'auto';
    };
  }, [isLoading]);

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

  // 🔥 تابع برای تعیین کلاس‌های grid
  const getGridClasses = () => {
    switch (screenSize) {
      case 'sm':
        return 'grid-cols-1';
      case 'md':
        return 'grid-cols-2';
      case 'lg':
        return 'grid-cols-2';
      case 'xl':
        return 'grid-cols-3';
      case '2xl':
        return 'grid-cols-4';
      case '3xl':
        return 'grid-cols-4';
      default:
        return 'grid-cols-4';
    }
  };

  return (
    <>
      {isLoading && <LoadingModal isVisible={isLoading} />}
      <main className="mx-auto bg-gradient-to-br from-gray-50 via-white to-blue-50/30 pb-16 min-h-screen">
        {/* Modern Progress Bar */}
        <div 
          className="h-1 bg-gradient-to-r from-[#0F2C59] via-[#2E4A7D] to-[#0F2C59] mx-auto transition-all duration-500 ease-out sticky top-0 z-30 rounded-b-lg shadow-lg"
          style={{ 
            width: `${scrollProgress * 0.9}%`,
            maxWidth: '100%'
          }}
        />

        {/* Featured Slider - Enhanced */}
        <div className="mb-12 relative">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-white/50 pointer-events-none z-10"></div>
          <FeaturedSlider sliderImages={sliderImages} />
        </div>

        {/* Categories Section - Modern */}
        <div className="w-full mb-8">
          <div className="bg-white/60 backdrop-blur-sm rounded-3xl mx-4 p-6 shadow-lg border border-white/50">
            <CategoriesCircle categories={categories} />
          </div>
        </div>
        
        {/* Discounted Products - Enhanced Modern */}
        <div className="mb-16 mx-4">
          <div className="bg-white/70 backdrop-blur-md rounded-3xl p-8 shadow-2xl border border-gray-200 relative overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-5">
              <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-[#0F2C59] to-[#2E4A7D]"></div>
            </div>
            
            <div className="relative mx-auto max-w-screen-2xl group">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold bg-gradient-to-r from-[#0F2C59] to-[#2E4A7D] bg-clip-text text-transparent mb-3">
                  محصولات تخفیف‌دار
                </h2>
                <div className="h-1 bg-gradient-to-r from-[#0F2C59] to-[#2E4A7D] rounded-full w-24 mx-auto"></div>
                <p className="text-gray-500 mt-3">بهترین تخفیف‌ها فقط برای شما</p>
              </div>
              
              {isMobile ? (
                  <div className="w-full flex justify-center items-center">
                    <ProductOffSlider products={discountedProducts} />
                  </div>
              ) : (
                <>
                  <div
                    ref={discountProductsRef}
                    className="flex overflow-x-auto gap-6 pb-6 scroll-smooth"
                    style={{ direction: 'ltr', scrollbarWidth: 'none' }}
                  >
                    {discountedProducts.map(product => (
                      <div key={product.id} className="transform transition-all duration-300 hover:scale-105">
                        <ProductOff
                          product={product}
                          className="flex-shrink-0 mr-4 w-72 shadow-lg rounded-2xl overflow-hidden"
                        />
                      </div>
                    ))}
                  </div>
                  
                  <div className="absolute top-1/2 left-0 transform -translate-y-1/2 flex justify-between w-full px-4">
                    <button
                      onClick={() => manualScroll(discountProductsRef, 'right')}
                      className="bg-white/90 hover:bg-white backdrop-blur-sm transition-all duration-300 
                      text-[#0F2C59] p-3 rounded-full shadow-xl hover:shadow-2xl hover:scale-110
                      w-12 h-12 flex items-center justify-center border-2 border-[#0F2C59]/20 hover:border-[#0F2C59]/50"
                    >
                      →
                    </button>
                    <button
                      onClick={() => manualScroll(discountProductsRef, 'left')}
                      className="bg-white/90 hover:bg-white backdrop-blur-sm transition-all duration-300 
                      text-[#0F2C59] p-3 rounded-full shadow-xl hover:shadow-2xl hover:scale-110
                      w-12 h-12 flex items-center justify-center border-2 border-[#0F2C59]/20 hover:border-[#0F2C59]/50"
                    >
                      ←
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Features Section - Ultra Modern */}
        <div className="my-20 mx-4 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50/60 via-white/80 to-indigo-50/60 rounded-3xl"></div>
          
          {/* Floating Elements */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-8 left-8 w-16 h-16 bg-gradient-to-br from-blue-200/30 to-purple-200/30 rounded-full animate-pulse" style={{animationDuration: '4s'}}></div>
            <div className="absolute top-32 right-16 w-12 h-12 bg-gradient-to-br from-purple-200/30 to-pink-200/30 rounded-full animate-pulse" style={{animationDelay: '1s', animationDuration: '5s'}}></div>
            <div className="absolute bottom-16 left-24 w-8 h-8 bg-gradient-to-br from-blue-300/30 to-indigo-300/30 rounded-full animate-pulse" style={{animationDelay: '2s', animationDuration: '3s'}}></div>
            <div className="absolute bottom-32 right-8 w-20 h-20 bg-gradient-to-br from-indigo-200/30 to-blue-200/30 rounded-full animate-pulse" style={{animationDelay: '0.5s', animationDuration: '6s'}}></div>
          </div>

          <div className="relative z-10 bg-white/80 backdrop-blur-md rounded-3xl p-10 shadow-2xl border border-white/50">
            <div className="text-center mb-16">
              <div className="inline-block relative">
                <h3 className="text-4xl font-bold bg-gradient-to-r from-[#0F2C59] via-[#2E4A7D] to-[#0F2C59] bg-clip-text text-transparent mb-4">
                  چرا نیک چرم؟
                </h3>
                <div className="h-1 bg-gradient-to-r from-[#0F2C59] to-[#2E4A7D] rounded-full w-28 mx-auto"></div>
                <div className="absolute -top-8 -right-8 w-16 h-16 bg-gradient-to-br from-blue-100/50 to-purple-100/50 rounded-full animate-ping opacity-40" style={{animationDuration: '4s'}}></div>
              </div>
              <p className="text-gray-600 mt-6 text-xl">بهترین انتخاب برای خرید محصولات چرمی با کیفیت</p>
            </div>
            
            <div className="grid grid-cols-2 gap-4 sm:gap-6 mb-8 md:grid-cols-2 lg:grid-cols-4">
              {[
                {
                  title: "گارانتی اصالت",
                  desc: "تضمین اصالت تمام محصولات",
                  icon: "M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z",
                  delay: "0s"
                },
                {
                  title: "ارسال سریع",
                  desc: "ارسال در کمترین زمان",
                  icon: "M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z",
                  delay: "0.1s"
                },
                {
                  title: "پشتیبانی ۲۴/۷",
                  desc: "همیشه در کنار شما",
                  icon: "M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z",
                  delay: "0.2s"
                },
                {
                  title: "پرداخت امن",
                  desc: "درگاه امن پرداخت",
                  icon: "M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z",
                  delay: "0.3s"
                }
              ].map((feature, index) => (
                <div 
                  key={index}
                  className="group bg-white/90 backdrop-blur-sm rounded-2xl p-3 sm:p-6 shadow-lg text-center hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-3 hover:scale-105 border-2 border-white/50 hover:border-[#0F2C59]/30"
                  style={{animationDelay: feature.delay}}
                >
                  <div className="w-12 h-12 sm:w-20 sm:h-20 bg-gradient-to-br from-[#0F2C59] to-[#2E4A7D] rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-6 group-hover:rotate-12 transition-transform duration-500 shadow-xl group-hover:shadow-2xl">
                    <svg className="w-7 h-7 sm:w-10 sm:h-10 text-white group-hover:scale-110 transition-transform duration-300" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d={feature.icon} clipRule="evenodd" />
                    </svg>
                  </div>
                  <h4 className="font-bold text-gray-800 mb-2 sm:mb-3 text-base sm:text-xl group-hover:text-[#0F2C59] transition-colors">{feature.title}</h4>
                  <p className="text-xs sm:text-base text-gray-600 leading-relaxed">{feature.desc}</p>
                  <div className="mt-3 sm:mt-6 h-1 bg-gradient-to-r from-[#0F2C59] to-[#2E4A7D] rounded-full w-0 group-hover:w-full transition-all duration-700 mx-auto"></div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 🔥 بخش همه محصولات - اصلاح شده */}
        <div id="all-products-section" className="relative my-12 mx-4">
          <div className="bg-white/80 backdrop-blur-md rounded-3xl p-8 shadow-2xl border border-gray-200">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold bg-gradient-to-r from-[#0F2C59] to-[#2E4A7D] bg-clip-text text-transparent mb-2">
                همه محصولات
              </h2>
              <div className="h-1 bg-gradient-to-r from-[#0F2C59] to-[#2E4A7D] rounded-full w-24 mx-auto"></div>
              <p className="text-gray-500 mt-2 text-base">جدیدترین و باکیفیت‌ترین محصولات چرمی</p>
            </div>
            
            {/* 🔥 Grid با responsive مناسب */}
            <div className={`grid ${getGridClasses()} gap-6 mb-8 justify-items-center`}>
              {currentProducts.map(product => (
                <div key={product.id} className="transition-all duration-300 hover:scale-105 w-full max-w-sm">
                  <ProductCard product={product} className="h-full w-full" />
                </div>
              ))}
            </div>
            
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-4">
                <button
                  onClick={() => paginate(currentPage - 1)}
                  disabled={currentPage === 1}
                  className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                    currentPage === 1
                      ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      : 'bg-white text-[#0F2C59] hover:bg-[#0F2C59] hover:text-white border border-[#0F2C59]'
                  }`}
                >
                  قبلی
                </button>
                
                {/* 🔥 محدود کردن نمایش شماره صفحات */}
                {(() => {
                  const maxPagesToShow = 5;
                  let startPage, endPage;
                  
                  if (totalPages <= maxPagesToShow) {
                    startPage = 1;
                    endPage = totalPages;
                  } else {
                    if (currentPage <= 3) {
                      startPage = 1;
                      endPage = maxPagesToShow;
                    } else if (currentPage + 2 >= totalPages) {
                      startPage = totalPages - maxPagesToShow + 1;
                      endPage = totalPages;
                    } else {
                      startPage = currentPage - 2;
                      endPage = currentPage + 2;
                    }
                  }
                  
                  const pageNumbers = [];
                  for (let i = startPage; i <= endPage; i++) {
                    pageNumbers.push(i);
                  }
                  
                  return pageNumbers.map((pageNumber) => (
                    <button
                      key={pageNumber}
                      onClick={() => paginate(pageNumber)}
                      className={`w-10 h-10 rounded-lg font-medium transition-all duration-300 ${
                        currentPage === pageNumber
                          ? 'bg-gradient-to-r from-[#0F2C59] to-[#2E4A7D] text-white shadow-lg'
                          : 'bg-white text-[#0F2C59] hover:bg-[#0F2C59] hover:text-white border border-[#0F2C59]'
                      }`}
                    >
                      {pageNumber}
                    </button>
                  ));
                })()}
                
                <button
                  onClick={() => paginate(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                    currentPage === totalPages
                      ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      : 'bg-white text-[#0F2C59] hover:bg-[#0F2C59] hover:text-white border border-[#0F2C59]'
                  }`}
                >
                  بعدی
                </button>
              </div>
            )}
            <div className="text-center mt-6 text-gray-400 text-sm">
              <span className="text-xs opacity-75">
                صفحه {currentPage} از {totalPages}
              </span>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}