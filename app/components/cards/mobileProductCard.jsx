'use client';
import React from 'react';
import Link from 'next/link';

const MobileProductCard = React.memo(({ product }) => {
  let imageSrc = '/leather-placeholder.jpg';

  // اولویت با مدل جدید Prisma
  if (Array.isArray(product.product_images) && product.product_images.length > 0 && product.product_images[0]?.url) {
    imageSrc = product.product_images[0].url;
  } else if (Array.isArray(product.images) && product.images.length > 0 && product.images[0]) {
    imageSrc = product.images[0].startsWith('/uploads/')
      ? product.images[0]
      : `/uploads/${product.images[0]}`;
  } else if (typeof product.image_url === 'string' && product.image_url.length > 0) {
    imageSrc = product.image_url.startsWith('/uploads/')
      ? product.image_url
      : `/uploads/${product.image_url}`;
  }

  return (
    <Link
      href={`/productView?id=${product.id}`}
      className="block"
      target="_blank"
      rel="noopener noreferrer"
    >
      <div className="w-91 p-4 bg-gray-100 rounded-lg border-gray-200 hover:bg-gray-100 transition-colors">
        <div className="flex items-stretch gap-4 w-full">
          {/* Container تصویر محصول */}
          <div className="w-28 h-28 flex-shrink-0 rounded-lg overflow-hidden border border-gray-300 bg-white">
            <img
              src={imageSrc}
              alt={product.name}
              className="w-full h-full object-cover"
              loading="lazy"
              onError={e => {
                if (e.target.src !== '/leather-placeholder.jpg') {
                  e.target.src = '/leather-placeholder.jpg';
                }
              }}
            />
          </div>

          {/* اطلاعات محصول */}
          <div className="flex-1 flex flex-col justify-center">
            <h3 className="text-[16px] font-bold text-gray-800 mb-1 leading-tight">
              {product.name}
            </h3>

            <div className="text-[13px] text-gray-600 space-y-0.5">
              {product.material && (
                <p className="text-[12px] text-gray-600">
                  جنس: {product.material}
                </p>
              )}
            </div>

            <p className="text-[17px] font-extrabold text-blue-600 mt-2">
              {product.price?.toLocaleString()} تومان
            </p>
          </div>
        </div>
      </div>
    </Link>
  );
});

export default MobileProductCard;