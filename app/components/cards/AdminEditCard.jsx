import Link from 'next/link';

export default function AdminEditCard({ product }) {
  const isOutOfStock = !product.stock_quantity || Number(product.stock_quantity) === 0;
  const textClass = isOutOfStock ? 'text-gray-400' : 'text-gray-800';
  const priceClass = isOutOfStock ? 'text-gray-400' : 'text-blue-600';
  const cardClass = isOutOfStock
    ? 'border border-black/20 bg-zinc-50 text-center rounded-lg p-3 md:p-4 w-56 md:w-64 flex-shrink-0 mx-2 shadow-md transition-shadow relative cursor-pointer opacity-60'
    : 'border border-black/20 bg-zinc-50 text-center rounded-lg p-3 md:p-4 w-56 md:w-64 flex-shrink-0 mx-2 shadow-md hover:shadow-lg transition-shadow relative cursor-pointer';

  // تصویر اصلی محصول (اولین تصویر یا عکس پیش‌فرض)
  const mainImage = product.product_images?.[0]?.url || '/placeholder.jpg';

  return (
    <div className="mb-4 relative">
      <Link href={`/productView?id=${product.id}`} target="_blank" rel="noopener noreferrer">
        <div className={cardClass}>
          {/* Image Container */}
          <div className="mb-3 md:mb-4">
            <img
              src={mainImage}
              alt={`${product.name} تصویر اصلی`}
              className="w-full aspect-square object-cover rounded-lg border border-gray-300 shadow-sm hover:shadow-md transition-transform duration-300 hover:scale-95"
              style={isOutOfStock ? { filter: 'grayscale(1)' } : {}}
            />
          </div>
          <div className={`text-center mb-2 md:hidden ${textClass}`}>
            <h2 className={`text-sm font-medium ${textClass}`}>{product.name}</h2>
            <p className={`text-sm font-medium mt-1 ${priceClass}`}>
              {isOutOfStock
                ? 'ناموجود'
                : `${Number(product.price).toLocaleString()} تومان`}
            </p>
          </div>
          <div className={`space-y-2 hidden md:block ${textClass}`}>
            <h2 className={`text-lg font-semibold ${textClass}`}>{product.name}</h2>
            <div className={`text-gray-600 flex flex-row gap-2 justify-center ${textClass}`}>
              <p>{product.categories?.name || 'دسته‌بندی نامشخص'}</p>
            </div>
            <p className={textClass}>{product.material}</p>
            <p className={textClass}>{product.color}</p>
            <p className={`text-lg font-medium mt-2 ${priceClass}`}>
              {isOutOfStock
                ? 'ناموجود'
                : `${Number(product.price).toLocaleString()} تومان`}
            </p>
          </div>
        </div>
      </Link>
      <Link
        href={`/admin/EditProduct/${product.id}`}
        className="absolute top-2 left-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        onClick={(e) => e.stopPropagation()}
      >
        ویرایش
      </Link>
    </div>
  );
}