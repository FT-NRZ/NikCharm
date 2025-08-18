'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from "framer-motion";

// آرایه رنگ‌های مدرن‌تر
const circleColors = ['#E3F2FD', '#BBDEFB', '#90CAF9', '#64B5F6'];

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
    const product = products.find(p => p.categoryid === categoryId && p.product_images && p.product_images.length > 0);
    return product?.product_images?.[0]?.url || '/leather-placeholder.jpg';
  };

  return (
    <div className="flex flex-wrap justify-center mt-4 md:mt-8 gap-10 sm:gap-16 px-4">
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
                scale: 1.15,
                boxShadow: '0 12px 20px rgba(0, 0, 0, 0.2)',
                transition: { duration: 0.4 },
              }}
              className="w-20 h-20 sm:w-36 sm:h-36 rounded-full shadow-lg flex items-center justify-center overflow-hidden relative"
              style={{
                background: `linear-gradient(135deg, ${circleColors[idx % circleColors.length]} 0%, #FFFFFF 100%)`,
                boxShadow: '0 8px 15px rgba(0, 0, 0, 0.1)',
              }}
            >
              <img
                src={getCategoryImage(category.id)}
                alt={category.name}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                style={{ borderRadius: '100%' }}
              />
            </motion.div>
            {/* نام دسته‌بندی */}
            <p className="mt-3 text-center text-gray-800 font-semibold text-sm sm:text-lg group-hover:scale-110 group-hover:text-blue-700 transition-transform duration-300">
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