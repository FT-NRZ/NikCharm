import React from 'react';

const LeatherProductCard = React.memo(({ product }) => {
  return (
    <div className="w-80 p-4 bg-gray-100 rounded-lg border-gray-200 hover:bg-gray-100 transition-colors">
      <div className="flex items-stretch gap-4 w-full">
        {/* Container تصویر چرم */}
        <div className="w-28 h-28 flex-shrink-0 rounded-lg overflow-hidden border border-gray-300 bg-white">
        <img
          src={product.images?.[0] || '/leather-placeholder.jpg'}
          alt={product.name}
          className="w-full h-full object-cover"
          loading="lazy"
          onError={(e) => {
            if (e.target.src !== '/leather-placeholder.jpg') {
              e.target.src = '/leather-placeholder.jpg';
            }
          }}
        />
        </div>

        {/* اطلاعات محصول چرمی */}
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
            {product.price.toLocaleString('fa-IR')} تومان
          </p>
        </div>
      </div>
    </div>
  );
});

export default LeatherProductCard;