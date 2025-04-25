'use client';
import productsData from './data/products.json';
import FeaturedSlider from './components/sliders/FeaturedSlider';
import ProductCard from './components/cards/ProductCard';
import CategoriesCircle from './components/cards/categoriesCircle';
import ProductOff from './components/cards/productOff';
import { useRef, useEffect, useCallback, useState } from 'react';

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
  const { products } = productsData || { products: [] };
  const mainProductsRef = useRef(null);
  const discountProductsRef = useRef(null);
  const lastScrollY = useRef(0);
  const [scrollProgress, setScrollProgress] = useState(0);

  const discountedProducts = products?.filter(p => p?.discountPercent > 0) || [];

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

  return (
    <main className="mx-auto bg-white pb-16">

      {/* Featured Slider */}
      <div className="mb-12">
        <FeaturedSlider products={products} />
      </div>

      {/* Discounted Products - حرکت به راست با اسکرول پایین */}
      <div className="mb-12 px-4">
        <div className="relative mx-auto max-w-screen-2xl group">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 text-right">محصولات تخفیف‌دار</h2>
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

          <div className="absolute top-1/2 left-0 transform -translate-y-1/2 flex justify-between w-full px-4">
            <button
              onClick={() => manualScroll(discountProductsRef, 'left')} // استفاده از discountProductsRef
              className="bg-white/80 hover:bg-white backdrop-blur-sm transition-all duration-300 
                        text-gray-700 p-3 rounded-full shadow-lg hover:shadow-xl hover:scale-105
                        w-12 h-12 flex items-center justify-center border border-gray-100"
            >
              ←
            </button>
            <button
              onClick={() => manualScroll(discountProductsRef, 'right')} // استفاده از discountProductsRef
              className="bg-white/80 hover:bg-white backdrop-blur-sm transition-all duration-300 
                        text-gray-700 p-3 rounded-full shadow-lg hover:shadow-xl hover:scale-105
                        w-12 h-12 flex items-center justify-center border border-gray-100"
            >
              →
            </button>
          </div>
        </div>
      </div>

      {/* Categories Section */}
      <div className="w-full">
        <h1 className='flex text-xl justify-center mb-4'>خرید بر اساس دسته بندی</h1>
        <div 
          className="h-0.5 bg-blue-500 mx-auto transition-all duration-300 ease-out max-w-[80%]"
          style={{ 
            width: `${scrollProgress * 0.8}%`,
            maxWidth: '100%' 
          }}
        />
        <div className="py-8 mb-14">
          <CategoriesCircle />
        </div>
      </div>

      {/* All Products - حرکت به چپ با اسکرول پایین */}
      <div className="relative mx-auto max-w-screen-2xl px-4 group">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 text-right">همه محصولات</h2>
        <div
          ref={mainProductsRef}
          className="flex overflow-x-auto gap-4 pb-4 scroll-smooth"
          style={{ direction: 'rtl', scrollbarWidth: 'none' }}
        >
          {products.map(product => (
            <ProductCard
              key={product.id}
              product={product}
              className="flex-shrink-0 ml-4 w-72"
            />
          ))}
        </div>

        <div className="absolute top-1/2 left-4 transform -translate-y-1/2 flex justify-between w-full px-4">
          <button
            onClick={() => manualScroll(mainProductsRef, 'left')}
            className="bg-white/80 hover:bg-white backdrop-blur-sm transition-all duration-300 
                      text-gray-700 p-3 rounded-full shadow-lg hover:shadow-xl hover:scale-105
                      w-12 h-12 flex items-center justify-center border border-gray-100"
          >
            ←
          </button>
          <button
            onClick={() => manualScroll(mainProductsRef, 'right')}
            className="bg-white/80 hover:bg-white backdrop-blur-sm transition-all duration-300 
                      text-gray-700 p-3 rounded-full shadow-lg hover:shadow-xl hover:scale-105
                      w-12 h-12 flex items-center justify-center border border-gray-100"
          >
            →
          </button>
        </div>
      </div>
    </main>
  );
}