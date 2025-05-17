'use client';
import { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';

const categories = [
  { id: 1, name: "زنانه" },
  { id: 2, name: "مردانه" },
  { id: 3, name: "اکسسوری" },
];

export default function ProductSlider({ products }) {
  const [current, setCurrent] = useState(0);
  const timeoutRef = useRef();
  const sliderRef = useRef();

  useEffect(() => {
    timeoutRef.current = setTimeout(() => {
      handleNext();
    }, 5000);
    return () => clearTimeout(timeoutRef.current);
  }, [current, products.length]);

  const handlePrev = () => {
    setCurrent(prev => (prev - 1 + products.length) % products.length);
  };

  const handleNext = () => {
    setCurrent(prev => (prev + 1) % products.length);
  };

  if (!products?.length) return null;

  return (
    <div className="w-full flex justify-center items-center mb-4">
      <button
        onClick={handlePrev}
        className="mx-2 bg-white/80 hover:bg-gray-100 rounded-full shadow p-2 text-xl z-10"
        aria-label="قبلی"
      >
        &#8592;
      </button>
      
      <div
        className="w-60 mx-2 overflow-hidden"
        style={{
          minWidth: '15rem',
          maxWidth: '90vw',
        }}
      >
        <motion.div
          ref={sliderRef}
          className="flex"
          animate={{ x: -current * 100 + '%' }}
          transition={{ 
            type: 'spring',
            stiffness: 300,
            damping: 30,
            duration: 0.5
          }}
        >
          {products.map((product, index) => (
            <div
              key={product.id}
              className="flex-shrink-0 w-full"
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
                        {product.price?.toLocaleString() || '۰'} تومان
                      </span>
                    </div>
                  </div>
                </Link>
              </div>
            </div>
          ))}
        </motion.div>
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