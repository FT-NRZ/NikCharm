
'use client';
import { useState } from 'react';
import {
  HiOutlineTrash,
  HiPlus,
  HiMinus,
  HiArrowRight,
  HiOutlineShoppingBag
} from 'react-icons/hi';
import {
  HiShoppingCart,
  HiCalendarDays,
  HiCreditCard,
  HiTruck
} from 'react-icons/hi2';

const initialCartItems = [
  {
    id: 1,
    name: 'کیف چرم مردانه نیک چرم',
    image: '/api/placeholder/300/300',
    price: 2850000,
    discountPrice: 2280000,
    color: 'قهوه‌ای',
    quantity: 1,
    inStock: true,
  },
  {
    id: 2,
    name: 'کفش چرم کلاسیک',
    image: '/api/placeholder/300/300',
    price: 3450000,
    discountPrice: null,
    color: 'مشکی',
    quantity: 1,
    inStock: true,
  },
];

const formatPrice = (price) => {
  return new Intl.NumberFormat('fa-IR').format(price) + ' تومان';
};

export default function ShoppingCart() {
  const [cartItems, setCartItems] = useState(initialCartItems);

  const subtotal = cartItems.reduce((total, item) => {
    return total + (item.discountPrice || item.price) * item.quantity;
  }, 0);

  const removeItem = (id) => {
    setCartItems(cartItems.filter((item) => item.id !== id));
  };

  const updateQuantity = (id, newQuantity) => {
    if (newQuantity <= 0) return;
    setCartItems(
      cartItems.map((item) =>
        item.id === id ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  if (cartItems.length === 0) {
    return (
      <div className="flex items-center justify-center h-screen bg-white text-center">
        <div className="p-8 rounded-2xl shadow-xl bg-gradient-to-b from-white to-blue-50 max-w-md">
          <div className="flex justify-center mb-6">
            <div className="bg-blue-50 p-5 rounded-full">
              <HiOutlineShoppingBag className="text-[#0F2C59] w-12 h-12" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-[#0F2C59] mb-2">سبد خرید خالی است</h2>
          <p className="text-gray-500 mb-6">محصولات دلخواه خود را انتخاب کنید</p>
          <button className="inline-flex items-center px-6 py-3 bg-[#0F2C59] text-white rounded-lg hover:bg-[#0F2C59]/90 transition">
            <span>مشاهده محصولات</span>
            <HiArrowRight className="mr-2" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen px-4 py-12">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8 border-b border-[#0F2C59]/10 pb-4">
          <div className="flex items-center gap-2 text-[#0F2C59]">
            <HiShoppingCart className="w-6 h-6" />
            <span className="text-sm">{cartItems.length} محصول</span>
          </div>
          <h1 className="text-3xl font-bold text-[#0F2C59] text-right">سبد خرید شما</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {cartItems.map((item) => (
              <div key={item.id} className="flex flex-col md:flex-row gap-6 p-6 rounded-xl shadow-md border border-gray-100 bg-white hover:shadow-lg transition">
                <div className="md:w-32 md:h-32 w-full h-48 rounded-xl overflow-hidden relative bg-gray-100">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-cover rounded-xl"
                  />
                </div>
                <div className="flex-1 text-right">
                  <h3 className="text-[#0F2C59] font-bold text-xl">{item.name}</h3>
                  <p className="text-sm text-gray-500 mt-1">رنگ: {item.color}</p>
                  <div className="flex items-center gap-3 mt-3">
                    {item.discountPrice ? (
                      <>
                        <span className="text-[#0F2C59] font-bold text-lg">{formatPrice(item.discountPrice)}</span>
                        <span className="text-gray-400 line-through text-sm">{formatPrice(item.price)}</span>
                        <span className="text-xs bg-[#0F2C59]/10 text-[#0F2C59] px-2 py-1 rounded-md">
                          {Math.round((1 - item.discountPrice / item.price) * 100)}٪ تخفیف
                        </span>
                      </>
                    ) : (
                      <span className="text-[#0F2C59] font-bold text-lg">{formatPrice(item.price)}</span>
                    )}
                  </div>
                </div>
                <div className="flex flex-col items-center justify-between gap-4">
                  <button onClick={() => removeItem(item.id)} className="text-red-500 hover:text-red-700 p-2 rounded-full hover:bg-red-50 transition">
                    <HiOutlineTrash size={20} />
                  </button>
                  <div className="flex items-center border border-[#0F2C59]/20 rounded-xl overflow-hidden">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="px-3 py-2 text-[#0F2C59] hover:bg-[#0F2C59]/5"
                      disabled={item.quantity <= 1}
                    >
                      <HiMinus size={16} />
                    </button>
                    <span className="px-4 text-[#0F2C59] font-semibold">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="px-3 py-2 text-[#0F2C59] hover:bg-[#0F2C59]/5"
                    >
                      <HiPlus size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-gradient-to-b from-white to-[#0F2C59]/5 p-6 rounded-xl border border-[#0F2C59]/10 shadow-md">
            <h2 className="text-[#0F2C59] font-bold text-xl mb-6 border-b border-[#0F2C59]/10 pb-3 text-right">خلاصه سفارش</h2>
            
            <div className="space-y-4 text-right mb-6">
              <div className="flex justify-between">
                <span className="text-[#0F2C59] font-medium">{formatPrice(subtotal)}</span>
                <span className="text-gray-600">مجموع</span>
              </div>
              <div className="flex justify-between">
                <span className="text-green-600">{subtotal > 5000000 ? 'رایگان' : formatPrice(150000)}</span>
                <span className="text-gray-600">هزینه ارسال</span>
              </div>
              <div className="flex justify-between border-t border-[#0F2C59]/10 pt-4 text-lg font-bold text-[#0F2C59]">
                <span>{formatPrice(subtotal + (subtotal > 5000000 ? 0 : 150000))}</span>
                <span>مبلغ کل</span>
              </div>
            </div>

            <div className="space-y-3 mb-6">
              <div className="flex items-center gap-3 text-[#0F2C59] text-sm">
                <HiTruck className="w-5 h-5" />
                <span className="text-right">ارسال رایگان برای خرید‌های بالای ۵,۰۰۰,۰۰۰ تومان</span>
              </div>
              <div className="flex items-center gap-3 text-[#0F2C59] text-sm">
                <HiCalendarDays className="w-5 h-5" />
                <span className="text-right">تحویل استاندارد: ۱ تا ۳ روز کاری</span>
              </div>
              <div className="flex items-center gap-3 text-[#0F2C59] text-sm">
                <HiCreditCard className="w-5 h-5" />
                <span className="text-right">پرداخت امن به همراه تضمین بازگشت وجه</span>
              </div>
            </div>

            <button className="w-full bg-[#0F2C59] text-white py-4 rounded-lg hover:bg-[#0F2C59]/90 transition flex justify-center items-center gap-2 shadow-lg shadow-[#0F2C59]/20">
              <HiShoppingCart size={20} /> ادامه خرید
            </button>

            <button className="block mt-4 w-full text-center text-[#0F2C59] py-2 border border-[#0F2C59]/20 rounded-lg hover:bg-[#0F2C59]/5 transition text-sm">
              بازگشت به فروشگاه
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}