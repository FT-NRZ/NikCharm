import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function AdminEditCard({ product }) {
  const [categoryNames, setCategoryNames] = useState(['دسته‌بندی نامشخص']); // Default fallback

  useEffect(() => {
    async function fetchCategoryNames() {
      try {
        // Fetch categories.json
        const response = await fetch('/api/categories');
        const data = await response.json();

        // Map categoryIds to their corresponding names
        const names = product.categoryIds
          .map((id) => {
            const category = data.categories.find((cat) => cat.id === id);
            return category ? category.name : null;
          })
          .filter((name) => name !== null); // Remove null values

        if (names.length > 0) {
          setCategoryNames(names);
        }
      } catch (error) {
        console.error('Error fetching category names:', error);
      }
    }

    fetchCategoryNames();
  }, [product.categoryIds]);

  return (
    <div className=" mb-4 relative">
      <Link href={`/productView?id=${product.id}`} target="_blank" rel="noopener noreferrer">
        <div className="border border-black/20 bg-zinc-50 text-center rounded-lg p-3 md:p-4 w-56 md:w-64 flex-shrink-0 mx-2 shadow-md hover:shadow-lg transition-shadow relative cursor-pointer">
          {/* Image Container */}
          <div className="mb-3 md:mb-4">
            <img
              src={product.images[0]} // Display the first image
              alt={`${product.name} تصویر اصلی`}
              className="w-full aspect-square object-cover rounded-lg border border-gray-300 shadow-sm hover:shadow-md transition-transform duration-300 hover:scale-95"
            />
          </div>

          {/* Product Name and Price (Mobile View) */}
          <div className="text-center mb-2 md:hidden">
            <h2 className="text-sm font-medium text-gray-800">{product.name}</h2>
            <p className="text-sm font-medium text-blue-600 mt-1">{product.price.toLocaleString()} تومان</p>
          </div>

          {/* Product Name, Categories, and Price (Desktop View) */}
          <div className="space-y-2 hidden md:block">
            <h2 className="text-lg font-semibold text-gray-800">{product.name}</h2>
            <div className="text-gray-600 flex flex-row gap-2 justify-center">
              {categoryNames.map((name, index) => (
                <p key={index}>
                  {name}
                  {index < categoryNames.length - 1 && '،'} {/* Add ، between names */}
                </p>
              ))}
            </div>
            <p className="text-gray-600">{product.material}</p>
            <p className="text-gray-600">{product.color}</p>
            <p className="text-lg font-medium text-blue-600">{product.price.toLocaleString()} تومان</p>
          </div>
        </div>
      </Link>

      {/* Edit Button */}
      <Link
        href={`/admin/EditProduct/${product.id}`}
        className="absolute top-2 left-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        onClick={(e) => e.stopPropagation()} // Prevent navigation to productView when clicking "ویرایش"
      >
        ویرایش
      </Link>
    </div>
  );
}