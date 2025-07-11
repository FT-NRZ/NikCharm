'use client';
import Link from 'next/link';

export default function ProductOff({ product, className }) {
  // انتخاب عکس معتبر (اولویت با مدل جدید)
  const imageSrc =
    (Array.isArray(product.product_images) && product.product_images[0]?.url) ||
    (Array.isArray(product.images) && product.images[0]) ||
    product.image_url ||
    '/placeholder.jpg';

  // درصد تخفیف
  const discountPercentage = product.discount ? Number(product.discount) : 0;

  return (
    <div className={`border-2 border-red-50 rounded-lg bg-gray-50 p-4 shadow-sm hover:shadow-md transition-shadow relative ${className}`}>
      <Link
        href={`/productView?id=${product.id}`}
        className="block"
        target="_blank"
        rel="noopener noreferrer"
      >
        {/* نشان تخفیف */}
        <div className="absolute top-2 left-2 bg-red-500 text-white px-3 py-1 rounded-full text-sm z-10">
          {discountPercentage}% تخفیف
        </div>

        {/* تصویر محصول */}
        <div className="mb-4 relative aspect-square">
          <img
            src={imageSrc}
            alt={product.name}
            className="w-full h-full object-cover rounded-lg transition-transform duration-300 hover:scale-105"
            onError={e => { e.target.src = '/placeholder.jpg'; }}
          />
        </div>

        {/* مشخصات محصول */}
        <div className="space-y-3 text-right">
          <h3 className="font-semibold text-gray-800">{product.name}</h3>

          <div className="text-sm text-gray-600">
            <p className="truncate">جنس: {product.material}</p>
            <p className="truncate">رنگ: {product.color}</p>
          </div>

          {/* بخش قیمت */}
          <div className="flex items-center gap-2 justify-end">
            <span className="font-medium text-lg text-red-600">
              {product.price ? Number(product.price).toLocaleString() : '۰'} تومان
            </span>
            <span className="text-gray-400 line-through text-sm">
              {product.originalPrice ? Number(product.originalPrice).toLocaleString() : '۰'}
            </span>
          </div>
        </div>
      </Link>
    </div>
  );
}