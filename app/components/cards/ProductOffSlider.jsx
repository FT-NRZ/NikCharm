'use client';
import { useRef, useState, useEffect } from 'react';
import Link from 'next/link';

// تابع امن برای فرمت کردن قیمت
const formatPrice = (price) => {
  if (!price || isNaN(price)) return '۰';
  
  try {
    return Number(price).toLocaleString('fa-IR');
  } catch (error) {
    try {
      return Number(price).toLocaleString();
    } catch (secondError) {
      return Number(price).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    }
  }
};

export default function ProductOffSlider({ products }) {
  const sliderRef = useRef();
  const [current, setCurrent] = useState(0);
  const [categories, setCategories] = useState([]);

  // دریافت دسته‌بندی‌ها از API
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/categories');
        const data = await response.json();
        if (data.categories) {
          setCategories(data.categories);
        }
      } catch (error) {
        console.error('خطا در دریافت دسته‌بندی‌ها:', error);
        // fallback به دسته‌بندی‌های ثابت
        setCategories([
          { id: 1, name: "زنانه" },
          { id: 2, name: "مردانه" },
          { id: 3, name: "اکسسوری" },
        ]);
      }
    };

    fetchCategories();
  }, []);

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

  // پیدا کردن نام دسته‌بندی
  const getCategoryName = (categoryId) => {
    const category = categories.find(cat => cat.id === categoryId);
    return category?.name || 'نامشخص';
  };

  // گرفتن تصویر اول محصول
  const getProductImage = (product) => {
    if (product.product_images && product.product_images.length > 0) {
      return product.product_images[0].url;
    }
    return '/placeholder.jpg';
  };

  // محاسبه قیمت با تخفیف
  const getDiscountedPrice = (price, discount) => {
    if (discount && discount > 0) {
      return price - (price * discount / 100);
    }
    return price;
  };

  if (!products?.length) return null;

  return (
    <div className="w-full flex justify-between items-center mb-4 relative">
      {/* دکمه بعدی (راست) */}
      <button
        onClick={() => handleScroll('right')}
        className="ml-2 bg-white/80 hover:bg-gray-100 rounded-full shadow p-2 text-xl z-10"
        aria-label="بعدی"
        type="button"
      >
        &#8594;
      </button>

        <div
          ref={sliderRef}
          className="flex-1 flex justify-center items-center w-full pb-2"
        >
        {products.map((product, idx) => {
          // انتخاب عکس معتبر
          const imageSrc = getProductImage(product);

          // درصد تخفیف
          const discount = product.discount || 0;

          return (
            <div
              key={product.id}
              className={`flex-shrink-0 w-60 transition-all duration-300 ${idx === current ? '' : 'opacity-60 scale-95 pointer-events-none'}`}
              style={{ display: idx === current ? 'block' : 'none' }}
            >
              <div className="bg-white border border-red-400 rounded-lg p-4 w-60 relative">
                {/* نشان تخفیف */}
                <span className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded z-10">
                  {discount ? `${discount}% تخفیف` : 'تخفیف'}
                </span>
                <Link
                  href={`/productView?id=${product.id}`}
                  className="block"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <div className="mb-4 aspect-square">
                    <img
                      src={imageSrc}
                      alt={product.name}
                      className="w-full h-full object-cover rounded-lg"
                      onError={e => { e.target.src = '/placeholder.jpg'; }}
                    />
                  </div>

                  <div className="space-y-2 text-right">
                    <h3 className="font-medium text-gray-900">{product.name}</h3>
                    <div className="flex flex-wrap gap-1">
                      <span className="px-2 py-1 text-xs text-gray-600 bg-gray-50 rounded">
                        {getCategoryName(product.categoryid)}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600 text-right">
                      <p className="truncate">جنس: {product.material || 'نامشخص'}</p>
                      <p className="truncate">رنگ: {product.color || 'نامشخص'}</p>
                    </div>
                    <div className="mt-2 flex items-center gap-2 text-right">
                      {/* قیمت نهایی (سمت راست) */}
                      <span className="font-medium text-gray-900">
                        {formatPrice(getDiscountedPrice(product.price, discount))} تومان
                      </span>                     
                      {/* قیمت قبلی (سمت چپ) */}
                      {discount > 0 && (
                        <span className="text-xs text-gray-400 line-through float-left">
                          {formatPrice(product.price)} تومان
                        </span>
                      )}
                      {/* clearfix */}
                      <div className="clear-both"></div>
                    </div>
                  </div>
                </Link>
              </div>
            </div>
          );
        })}
      </div>

      {/* دکمه قبلی (چپ) */}
      <button
        onClick={() => handleScroll('left')}
        className="mr-2 bg-white/80 hover:bg-gray-100 rounded-full shadow p-2 text-xl z-10"
        aria-label="قبلی"
        type="button"
      >
        &#8592;
      </button>
    </div>
  );
}