'use client';
import { useEffect, useState, useRef } from 'react';
import ProductOff from './productOff';

export default function ProductOffSlider({ products }) {
  const [current, setCurrent] = useState(0);
  const timeoutRef = useRef();
  const sliderContainerRef = useRef();

  // اسلاید خودکار هر ۵ ثانیه
  useEffect(() => {
    timeoutRef.current = setTimeout(() => {
      handleNext();
    }, 5000);
    return () => clearTimeout(timeoutRef.current);
  }, [current, products.length]);

  const handlePrev = () => {
    setCurrent((prev) => (prev - 1 + products.length) % products.length);
  };

  const handleNext = () => {
    setCurrent((prev) => (prev + 1) % products.length);
  };

  if (!products?.length) return null;

  return (
    <div className="w-full flex justify-center items-center">
      <button
        onClick={handlePrev}
        className="mx-2 bg-white/80 hover:bg-gray-100 rounded-full shadow p-2 text-xl z-10"
        aria-label="قبلی"
      >
        &#8592;
      </button>
      
      <div
        ref={sliderContainerRef}
        className="overflow-hidden w-60 mx-2"
        style={{
          minWidth: '15rem',
          maxWidth: '90vw',
        }}
      >
        <div
          className="flex transition-transform duration-700 ease-in-out"
          style={{
            transform: `translateX(-${current * 100}%)`,
          }}
        >
          {products.map((product, index) => (
            <div
              key={index}
              className="flex-shrink-0 w-full"
            >
              <ProductOff product={product} />
            </div>
          ))}
        </div>
      </div>

      <button
        onClick={handleNext}
        className="mx-2 bg-white/80 hover:bg-gray-100 rounded-full shadow p-2 text-xl z-10"
        aria-label="بعدی"
      >
        &#8594;
      </button>
    </div>
  );
}