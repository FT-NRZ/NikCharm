'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

const FeaturedSlider = ({ products = [] }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const router = useRouter();

  // بررسی اینکه products یک آرایه معتبر است
  const validProducts = Array.isArray(products) ? products : [];
  
  // Get top 3 products with valid data
  const featuredProducts = validProducts
    .filter((product) => product.id && product.price !== undefined && product.images?.length > 0)
    .sort((a, b) => a.price - b.price)
    .slice(0, 3);

  // اگر هیچ محصولی وجود نداشت
  if (featuredProducts.length === 0) {
    return (
      <div className="relative bg-white border-t border-black/20 w-full sm:h-[400px] h-[250px] overflow-hidden shadow-xl flex items-center justify-center">
        <p className="text-gray-500">هیچ محصولی برای نمایش وجود ندارد</p>
      </div>
    );
  }

  useEffect(() => {
    if (featuredProducts.length <= 1) return;

    const timer = setInterval(() => {
      setCurrentSlide((prevSlide) =>
        prevSlide === featuredProducts.length - 1 ? 0 : prevSlide + 1
      );
    }, 6000);

    return () => clearInterval(timer);
  }, [featuredProducts.length]);

  // 🔧 تابع فرمت قیمت اصلاح شده - حل مشکل Hydration
  const formatPrice = (price) => {
    if (price === undefined || price === null) return 'نامشخص';
    // استفاده از فرمت ثابت برای سرور و کلاینت
    return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };

  const handleSlideClick = (productId) => {
    if (!productId) return;
    // Open the product in a new tab
    window.open(`/productView?id=${productId}`, '_blank');
  };

  const handleSlideChange = (newSlide) => {
    if (newSlide < 0 || newSlide >= featuredProducts.length) return;
    setIsAnimating(true);
    setCurrentSlide(newSlide);
    setTimeout(() => setIsAnimating(false), 500);
  };

  return (
    <div className="relative bg-white border-t border-black/20 w-full sm:h-[400px] h-[250px] overflow-hidden shadow-xl">
      {/* Slides Container */}
      <div className="relative h-full w-full">
        {featuredProducts.map((product, index) => (
          <div
            key={product.id}
            className={`absolute top-0 left-0 w-full h-full flex transition-opacity duration-500 ease-in-out ${
              currentSlide === index ? 'opacity-100 z-10' : 'opacity-0 z-0'
            }`}
            onClick={() => handleSlideClick(product.id)}
          >
            <div className="flex w-full h-full bg-white cursor-pointer">
              {/* Product Info */}
              <div
                className={`w-1/2 h-full flex flex-col justify-center items-center p-8 transition-transform duration-500 ${
                  isAnimating ? 'translate-y-4 opacity-0' : 'translate-y-0 opacity-100'
                }`}
              >
                <h2 className="text-2xl font-bold mb-4">{product.name || 'محصول بدون نام'}</h2>
                <p className="text-xl font-semibold text-gray-700">
                  {formatPrice(product.price || 0)} تومان
                </p>
              </div>

              {/* Product Image */}
              <div className="w-1/2 h-full relative p-4">
                <Image
                  src={product.images[0]}
                  alt={product.name || 'محصول'}
                  fill
                  className={`object-contain transition-transform duration-500 ${
                    isAnimating ? 'scale-95' : 'scale-100'
                  }`}
                  priority
                  sizes="(max-width: 768px) 50vw, 25vw"
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Navigation Arrows - فقط اگر بیش از یک محصول داشته باشیم */}
      {featuredProducts.length > 1 && (
        <>
          <button
            className="absolute sm:block hidden left-4 top-1/2 -translate-y-1/2 bg-white/20 p-3 rounded-full backdrop-blur-sm hover:bg-white/40 transition-colors z-20"
            onClick={() =>
              handleSlideChange(currentSlide === 0 ? featuredProducts.length - 1 : currentSlide - 1)
            }
          >
            <svg
              className="w-6 h-6 text-black"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>
          <button
            className="absolute sm:block hidden right-4 top-1/2 -translate-y-1/2 bg-white/20 p-3 rounded-full backdrop-blur-sm hover:bg-white/40 transition-colors z-20"
            onClick={() =>
              handleSlideChange(currentSlide === featuredProducts.length - 1 ? 0 : currentSlide + 1)
            }
          >
            <svg
              className="w-6 h-6 text-black"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
        </>
      )}

      {/* Slide Indicators - فقط اگر بیش از یک محصول داشته باشیم */}
      {featuredProducts.length > 1 && (
        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex space-x-2 z-20">
          {featuredProducts.map((_, index) => (
            <button
              key={index}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                currentSlide === index
                  ? 'bg-black w-8'
                  : 'bg-black/50 hover:bg-black/70'
              }`}
              onClick={() => handleSlideChange(index)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default FeaturedSlider;