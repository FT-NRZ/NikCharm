'use client';
import Link from 'next/link';

const categories = [
  { id: 1, name: "زنانه" },
  { id: 2, name: "مردانه" },
  { id: 3, name: "اکسسوری" },
];

export default function ProductCard({ product, className }) {
  return (
    <div className={`border border-gray-200 rounded-lg bg-gray-50 p-4 shadow-sm hover:shadow-md transition-shadow w-72 ${className}`}>
      <Link
        href={`/productView?id=${product.id}`}
        className="block"
        target="_blank"
        rel="noopener noreferrer"
      >
        <div className="mb-4 relative aspect-square">
          <img
            src={product.images?.[0] || '/placeholder.jpg'}
            alt={product.name}
            className="w-full h-full object-cover rounded-lg hover:scale-102 transition-transform duration-300"
          />
        </div>

        <div className="space-y-3 text-right">
          <h3 className="font-semibold text-gray-800">{product.name}</h3>
          
          <div className="flex flex-wrap gap-2">
            {product.categoryIds?.map(id => (
              <span key={id} className="px-2 py-1 bg-gray-100 text-xs rounded-full">
                {categories.find(c => c.id === id)?.name || 'نامشخص'}
              </span>
            ))}
          </div>

          <div className="text-sm text-gray-600">
            <p className="truncate">جنس: {product.material}</p>
            <p className="truncate">رنگ: {product.color}</p>
          </div>

          <div className="flex items-center gap-2 mt-2">
            <span className="font-medium text-lg text-blue-600">
              {product.price?.toLocaleString() || '۰'} تومان
            </span>
          </div>
        </div>
      </Link>
    </div>
  );
}