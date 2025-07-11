'use client';
import Link from 'next/link';

export default function ProductCard({ product, className }) {
  // انتخاب عکس معتبر (اولویت با مدل جدید)
  const imageSrc =
    (Array.isArray(product.product_images) && product.product_images[0]?.url) ||
    (Array.isArray(product.images) && product.images[0]) ||
    product.image_url ||
    '/placeholder.jpg';

  // منطق ناموجود بودن
  const isOutOfStock = !product.stock_quantity || Number(product.stock_quantity) === 0;
  const textClass = isOutOfStock ? 'text-gray-400' : 'text-gray-800';
  const priceClass = isOutOfStock ? 'text-gray-400' : 'text-blue-600';
  const cardClass = isOutOfStock
    ? `border border-gray-200 rounded-lg bg-gray-50 p-4 shadow-sm transition-shadow w-72 opacity-60 ${className}`
    : `border border-gray-200 rounded-lg bg-gray-50 p-4 shadow-sm hover:shadow-md transition-shadow w-72 ${className}`;

  return (
    <div className={cardClass}>
      <Link
        href={`/productView?id=${product.id}`}
        className="block"
        target="_blank"
        rel="noopener noreferrer"
      >
        <div className="mb-4 relative w-full aspect-square overflow-hidden">
          <img
            src={imageSrc}
            alt={product.name}
            className="w-full h-full object-cover rounded-lg transition-transform duration-300"
            style={isOutOfStock ? { filter: 'grayscale(1)' } : {}}
            onError={e => { e.target.src = '/placeholder.jpg'; }}
          />
        </div>

        <div className="space-y-3 text-right">
          <h3 className={`font-semibold ${textClass}`}>{product.name}</h3>
          <div className="flex flex-wrap gap-2">
            {product.categories && (
              <span
                key={product.categories.id}
                className={`px-2 py-1 bg-gray-100 text-xs rounded-full ${textClass}`}
              >
                {product.categories.name}
              </span>
            )}
          </div>
          <div className={`text-sm ${textClass}`}>
            <p className="truncate">جنس: {product.material}</p>
            <p className="truncate">رنگ: {product.color}</p>
          </div>
          <div className="flex items-center gap-2 mt-2">
            <span className={`font-medium text-lg ${priceClass}`}>
              {isOutOfStock
                ? 'ناموجود'
                : `${product.price?.toLocaleString() || '۰'} تومان`}
            </span>
          </div>
        </div>
      </Link>
    </div>
  );
}