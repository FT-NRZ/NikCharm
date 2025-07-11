'use client';
import { useRef, useState, useEffect } from 'react';
import Link from 'next/link';

const categories = [
  { id: 1, name: "زنانه" },
  { id: 2, name: "مردانه" },
  { id: 3, name: "اکسسوری" },
];

export default function ProductSlider({ products }) {
  const sliderRef = useRef();
  const [current, setCurrent] = useState(0);

  // اسکرول خودکار هر ۵ ثانیه
  useEffect(() => {
    if (!products?.length) return;
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % products.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [products]);

  // اسکرول به کارت فعلی
  useEffect(() => {
    if (sliderRef.current) {
      const cardWidth = sliderRef.current.firstChild?.offsetWidth || 0;
      sliderRef.current.scrollTo({
        left: current * (cardWidth + 16), // 16px gap-4
        behavior: 'smooth'
      });
    }
  }, [current]);

  const handleScroll = (direction) => {
    if (!products?.length) return;
    setCurrent((prev) => {
      if (direction === 'right') {
        return prev === products.length - 1 ? 0 : prev + 1;
      } else {
        return prev === 0 ? products.length - 1 : prev - 1;
      }
    });
  };

  if (!products?.length) return null;

  return (
    <div className="w-full flex items-center mb-4 relative">
      {/* دکمه بعدی (راست) */}
      <button
        onClick={() => handleScroll('right')}
        className="mx-2 bg-white/80 hover:bg-gray-100 rounded-full shadow p-2 text-xl z-10"
        aria-label="بعدی"
        type="button"
      >
        &#8594;
      </button>

      <div
        ref={sliderRef}
        className="flex overflow-x-auto gap-4 pb-2 scroll-smooth"
        style={{
          direction: 'rtl',
          scrollbarWidth: 'none'
        }}
      >
        {products.map((product, idx) => (
          <div
            key={product.id}
            className={`flex-shrink-0 w-60 transition-all duration-300 ${idx === current ? '' : 'opacity-60 scale-95 pointer-events-none'}`}
            style={{ display: idx === current ? 'block' : 'none' }}
          >
            <div className="bg-white border border-gray-200 rounded-lg p-4 w-60">
              <Link
                href={`/productView?id=${product.id}`}
                className="block"
                target="_blank"
                rel="noopener noreferrer"
              >
                <div className="mb-4 aspect-square">
                  <img
                    src={product.images?.[0] || '/placeholder.jpg'}
                    alt={product.name}
                    className="w-full h-full object-cover rounded-lg"
                  />
                </div>

                <div className="space-y-2 text-right">
                  <h3 className="font-medium text-gray-900">{product.name}</h3>
                  <div className="flex flex-wrap gap-1">
                    {product.categoryIds?.map(id => (
                      <span
                        key={id}
                        className="px-2 py-1 text-xs text-gray-600 bg-gray-50 rounded"
                      >
                        {categories.find(c => c.id === id)?.name || 'نامشخص'}
                      </span>
                    ))}
                  </div>
                  <div className="text-sm text-gray-600">
                    <p className="truncate">جنس: {product.material}</p>
                    <p className="truncate">رنگ: {product.color}</p>
                  </div>
                  <div className="mt-2">
                    <span className="font-medium text-gray-900">
                      {product.price !== undefined && product.price !== null
                        ? product.price.toLocaleString('en-US')
                        : '0'} تومان
                    </span>
                  </div>
                </div>
              </Link>
            </div>
          </div>
        ))}
      </div>

      {/* دکمه قبلی (چپ) */}
      <button
        onClick={() => handleScroll('left')}
        className="mx-2 bg-white/80 hover:bg-gray-100 rounded-full shadow p-2 text-xl z-10"
        aria-label="قبلی"
        type="button"
      >
        &#8592;
      </button>
    </div>
  );
}