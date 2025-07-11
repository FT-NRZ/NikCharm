'use client';
import { useState, useEffect } from 'react';
import Image from 'next/image';

const FeaturedSlider = ({ sliderImages = [] }) => {
  // sliderImages به صورت پیش‌فرض به آرایه خالی مقداردهی می‌شود.
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (sliderImages.length === 0) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) =>
        prev === sliderImages.length - 1 ? 0 : prev + 1
      );
    }, 6000);
    return () => clearInterval(timer);
  }, [sliderImages]);

  const handleSlideChange = (newSlide) => {
    setIsAnimating(true);
    setCurrentSlide(newSlide);
    setTimeout(() => setIsAnimating(false), 500);
  };

  if (sliderImages.length === 0) {
    // در صورت عدم وجود تصاویر، یک placeholder نمایش دهید
    return (
      <div className="relative bg-gray-100 border-t border-black/20 w-full sm:h-[400px] h-[250px] flex items-center justify-center">
        <p className="text-gray-500">تصویری برای اسلایدر موجود نیست</p>
      </div>
    );
  }

  return (
    <div className="relative bg-white border-t border-black/20 w-full sm:h-[400px] h-[250px] overflow-hidden shadow-xl">
      {/* Slides Container */}
      <div className="relative h-full w-full">
        {sliderImages.map((slider, index) => (
          <div
            key={slider.id}
            className={`absolute top-0 left-0 w-full h-full flex transition-opacity duration-500 ease-in-out ${
              currentSlide === index ? 'opacity-100 z-10' : 'opacity-0 z-0'
            }`}
          >
            <div className="w-full h-full relative">
              <Image
                src={slider.imageUrl}
                alt="Slider Image"
                fill
                className={`object-cover transition-transform duration-500 ${
                  isAnimating ? 'scale-95' : 'scale-100'
                }`}
                priority
              />
            </div>
          </div>
        ))}
      </div>

      {/* Navigation Arrows */}
      {/* “Next” arrow (visually on the LEFT in RTL) */}
      <button
        className="absolute sm:block hidden left-4 top-1/2 -translate-y-1/2 bg-white/20 p-3 rounded-full backdrop-blur-sm hover:bg-white/40 transition-colors z-20"
        onClick={() =>
          handleSlideChange(
            currentSlide === sliderImages.length - 1 ? 0 : currentSlide + 1
          )
        }
      >
        <svg className="w-6 h-6 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      {/* “Previous” arrow (visually on the RIGHT in RTL) */}
      <button
        className="absolute sm:block hidden right-4 top-1/2 -translate-y-1/2 bg-white/20 p-3 rounded-full backdrop-blur-sm hover:bg-white/40 transition-colors z-20"
        onClick={() =>
          handleSlideChange(
            currentSlide === 0 ? sliderImages.length - 1 : currentSlide - 1
          )
        }
      >
        <svg className="w-6 h-6 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
        </svg>
      </button>

      {/* Slide Indicators */}
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
    </div>
  );
};

export default FeaturedSlider;