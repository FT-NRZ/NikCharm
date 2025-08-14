'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from "framer-motion";

// آرایه رنگ‌های قهوه‌ای و کرم و جیگری
const circleColors = ['#DAC0A3', '#A08963', '#4B352A', '#3D0301'];

export default function CategoriesCircle({ categories: propCategories }) {
  const [categories, setCategories] = useState(propCategories || []);
  const [products, setProducts] = useState([]);
  const router = useRouter();

  // اگر propCategories نیامده بود، از API بگیر
  useEffect(() => {
    if (!propCategories || propCategories.length === 0) {
      fetch('/api/categories')
        .then(res => res.json())
        .then(data => setCategories(data.categories || []));
    }
  }, [propCategories]);

  // گرفتن محصولات برای نمایش عکس هر دسته‌بندی
  useEffect(() => {
    fetch('/api/products')
      .then(res => res.json())
      .then(data => setProducts(Array.isArray(data.products) ? data.products : []));
  }, []);

  // کلیک روی دسته‌بندی
  const handleCategoryClick = (categoryId) => {
    router.push(`/products?category=${categoryId}`);
  };

  // پیدا کردن تصویر برای هر دسته‌بندی
  const getCategoryImage = (categoryId) => {
    // اولین محصول این دسته‌بندی
    const product = products.find(p => p.categoryid === categoryId && p.product_images && p.product_images.length > 0);
    return product?.product_images?.[0]?.url || '/leather-placeholder.jpg';
  };

  return (
    <div className="flex flex-wrap justify-center mt-2 md:mt-8 gap-8 sm:gap-20 px-4">
      {categories.length > 0 ? (
        categories.map((category, idx) => (
          <div
            key={category.id}
            className="flex flex-col items-center group transition-transform duration-300 cursor-pointer"
            onClick={() => handleCategoryClick(category.id)}
          >
            {/* دایره با عکس محصول */}
            <motion.div
              whileHover={{
                scale: 1.1,
                rotate: [0, 2, -2, 2, -2, 0],
                transition: { duration: 0.5 },
              }}
              className="w-16 h-16 sm:w-35 sm:h-35 rounded-full border-1 shadow-lg flex items-center justify-center overflow-hidden"
              style={{
                backgroundColor: circleColors[idx % circleColors.length],
                borderColor: 'rgba(255,255,255,0.7)',
                borderWidth: '4px',
              }}
            >
              <img
                src={getCategoryImage(category.id)}
                alt={category.name}
                className="w-full h-full object-cover"
                style={{ borderRadius: '100%' }}
              />
            </motion.div>
            {/* نام دسته‌بندی */}
            <p className="mt-2 sm:mt-2 text-center text-gray-800 font-semibold text-sm sm:text-lg group-hover:scale-110 group-hover:text-red-900 transition-transform duration-300">
              {category.name}
            </p>
          </div>
        ))
      ) : (
        <p className="text-gray-500">دسته‌بندی‌ای یافت نشد</p>
      )}
    </div>
  );
}