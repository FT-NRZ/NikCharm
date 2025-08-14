'use client';
import { useState, useEffect } from 'react';
import Image from 'next/image';

const FeaturedSlider = ({ sliderImages = [] }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  // اگر هیچ تصویر وجود نداشت
  useEffect(() => {
    if (sliderImages.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentSlide((prevSlide) =>
        prevSlide === sliderImages.length - 1 ? 0 : prevSlide + 1
      );
    }, 6000);
    return () => clearInterval(timer);
  }, [sliderImages.length]);

  const handleSlideChange = (newSlide) => {
    if (newSlide < 0 || newSlide >= sliderImages.length) return;
    setIsAnimating(true);
    setCurrentSlide(newSlide);
    setTimeout(() => setIsAnimating(false), 500);
  };

  // شرط نمایش پیام اگر هیچ تصویر نیست
  if (!Array.isArray(sliderImages) || sliderImages.length === 0) {
    return (
      <div className="relative bg-white border-t border-black/20 w-full sm:h-[400px] h-[250px] overflow-hidden shadow-xl flex items-center justify-center">
        <p className="text-gray-500">هیچ تصویری برای نمایش وجود ندارد</p>
      </div>
    );
  }

  return (
    <div className="relative bg-white border-t border-black/20 w-full sm:h-[500px] h-[250px] overflow-hidden shadow-xl">
      {/* Slides Container */}
      <div className="relative h-full w-full">
        {sliderImages.map((item, index) => (
          <div
            key={item.id || index}
            className={`absolute top-0 left-0 w-full h-full flex transition-opacity duration-500 ease-in-out ${
              currentSlide === index ? 'opacity-100 z-10' : 'opacity-0 z-0'
            }`}
          >
            <div className="flex w-full h-full bg-white cursor-pointer">
              <div className="w-full h-full relative p-4 flex items-center justify-center">
                <Image
                  src={item.imageUrl}
                  alt={`اسلایدر ${index + 1}`}
                  fill
                  style={{objectFit: 'cover'}}
                  className={`object-cover transition-transform duration-500 ${
                    isAnimating ? 'scale-95' : 'scale-100'
                  }`}
                  priority
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Navigation Arrows */}
      {sliderImages.length > 1 && (
        <>
          <button
            className="absolute sm:block hidden left-4 top-1/2 -translate-y-1/2 bg-white/20 p-3 rounded-full backdrop-blur-sm hover:bg-white/40 transition-colors z-20"
            onClick={() =>
              handleSlideChange(currentSlide === 0 ? sliderImages.length - 1 : currentSlide - 1)
            }
          >
            <svg className="w-6 h-6 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            className="absolute sm:block hidden right-4 top-1/2 -translate-y-1/2 bg-white/20 p-3 rounded-full backdrop-blur-sm hover:bg-white/40 transition-colors z-20"
            onClick={() =>
              handleSlideChange(currentSlide === sliderImages.length - 1 ? 0 : currentSlide + 1)
            }
          >
            <svg className="w-6 h-6 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </>
      )}

      {/* Slide Indicators */}
      {sliderImages.length > 1 && (
        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex space-x-2 z-20">
          {sliderImages.map((_, index) => (
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