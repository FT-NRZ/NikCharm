import { HiOutlineTrash, HiPlus, HiMinus } from 'react-icons/hi';

const formatPrice = (price) => {
  return new Intl.NumberFormat('fa-IR').format(price) + ' تومان';
};

export default function CartCard({ item, onRemove, onUpdateQuantity }) {
  // تصویر محصول: اولویت با product_images یا images
  const mainImage =
    item.product_images?.[0]?.url ||
    item.images?.[0] ||
    item.image_url ||
    item.image ||
    '/leather-placeholder.jpg';

  return (
    <div className="flex flex-col md:flex-row gap-6 p-6 rounded-xl shadow-md border border-gray-100 bg-white hover:shadow-lg transition">
      <div className="md:w-32 md:h-32 w-full h-48 rounded-xl overflow-hidden relative bg-gray-100">
        <img
          src={mainImage}
          alt={item.name}
          className="w-full h-full object-cover rounded-xl"
        />
      </div>
      <div className="flex-1 text-right">
        <h3 className="text-[#0F2C59] font-bold text-xl">{item.name}</h3>
        <p className="text-sm text-gray-500 mt-1">رنگ: {item.color}</p>
        <div className="flex items-center gap-3 mt-3">
          {(item.discountPrice || item.discount_price) ? (
            <>
              <span className="text-[#0F2C59] font-bold text-lg">
                {formatPrice(item.discountPrice || item.discount_price)}
              </span>
              <span className="text-gray-400 line-through text-sm">
                {formatPrice(item.price)}
              </span>
              <span className="text-xs bg-[#0F2C59]/10 text-[#0F2C59] px-2 py-1 rounded-md">
                {Math.round(
                  (1 - (item.discountPrice || item.discount_price) / item.price) * 100
                )}٪ تخفیف
              </span>
            </>
          ) : (
            <span className="text-[#0F2C59] font-bold text-lg">
              {formatPrice(item.price)}
            </span>
          )}
        </div>
      </div>
      <div className="flex flex-col items-center justify-between gap-4">
        <button onClick={() => onRemove(item.id)} className="text-red-500 hover:text-red-700 p-2 rounded-full hover:bg-red-50 transition">
          <HiOutlineTrash size={20} />
        </button>
        <div className="flex items-center border border-[#0F2C59]/20 rounded-xl overflow-hidden">
          <button
            onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
            className="px-3 py-2 text-[#0F2C59] hover:bg-[#0F2C59]/5"
            disabled={item.quantity <= 1}
          >
            <HiMinus size={16} />
          </button>
          <span className="px-4 text-[#0F2C59] font-semibold">{item.quantity}</span>
          <button
            onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
            className="px-3 py-2 text-[#0F2C59] hover:bg-[#0F2C59]/5"
          >
            <HiPlus size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}