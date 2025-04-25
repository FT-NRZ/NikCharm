'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation'; // Import useRouter for navigation

export default function CategoriesCircle() {
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const router = useRouter(); // Initialize useRouter

  useEffect(() => {
    // Fetch categories.json
    async function fetchCategories() {
      try {
        const res = await fetch('/api/categories');
        if (!res.ok) throw new Error('Failed to fetch categories');
        const data = await res.json();
        setCategories(data.categories || []);
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    }

    // Fetch products.json
    async function fetchProducts() {
      try {
        const res = await fetch('/api/products');
        if (!res.ok) throw new Error('Failed to fetch products');
        const data = await res.json();
        setProducts(data.products || []);
      } catch (error) {
        console.error('Error fetching products:', error);
      }
    }

    fetchCategories();
    fetchProducts();
  }, []);

  // Get a product image for each category
  const getCategoryImage = (categoryId) => {
    const product = products.find((product) => product.categoryIds.includes(categoryId));
    return product ? product.images[0] : '/placeholder.jpg'; // Fallback to a placeholder image
  };

  // Handle category click
  const handleCategoryClick = (categoryId) => {
    router.push(`/products?category=${categoryId}`); // Navigate to products page with category filter
  };

  return (
    <div className="flex flex-wrap justify-center gap-8 sm:gap-20 mt-8 px-4">
      {categories.length > 0 ? (
        categories.map((category) => (
          <div
            key={category.id}
            className="flex flex-col items-center group transition-transform duration-300 cursor-pointer"
            onClick={() => handleCategoryClick(category.id)} // Add click handler
          >
            {/* Circle with product image */}
            <div className="w-24 h-24 sm:w-36 sm:h-36 rounded-full overflow-hidden border-1 border-gradient-to-r from-blue-500 to-purple-500 shadow-lg group-hover:scale-110 transition-transform duration-300">
              <img
                src={getCategoryImage(category.id)}
                alt={category.name}
                className="w-full h-full object-cover"
              />
            </div>
            {/* Category name */}
            <p className="mt-2 sm:mt-4 text-center text-gray-800 font-semibold text-sm sm:text-lg group-hover:scale-110 group-hover:text-red-900 transition-transform duration-300">
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