'use client';
import { useState, useEffect } from 'react';
import Header from "../components/Header";
import CheckoutModal from "../components/CheckoutModal";
import {
  HiArrowRight,
  HiOutlineShoppingBag
} from 'react-icons/hi';
import {
  HiShoppingCart,
  HiCalendarDays,
  HiCreditCard,
  HiTruck
} from 'react-icons/hi2';
import { useRouter } from 'next/navigation';
import CartCard from '../components/cards/cartCard';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


const formatPrice = (price) => {
  return new Intl.NumberFormat('fa-IR').format(price) + ' تومان';
};

// خط 25 تا 60 را با این جایگزین کن:

export default function ShoppingCart() {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const router = useRouter();

  // گرفتن اطلاعات محصولات سبد خرید از دیتابیس
  useEffect(() => {
    const fetchCartProducts = async () => {
      const stored = localStorage.getItem('cart');
      if (!stored) {
        setCartItems([]);
        setLoading(false);
        return;
      }
      const cart = JSON.parse(stored);
      if (cart.length === 0) {
        setCartItems([]);
        setLoading(false);
        return;
      }
      const products = await Promise.all(
        cart.map(async (ci) => {
          const res = await fetch(`/api/products?id=${ci.id}`);
          const data = await res.json();
          if (data.product) {
            return { ...data.product, quantity: ci.quantity };
          }
          return null;
        })
      );
      setCartItems(products.filter(Boolean));
      setLoading(false);
    };
    fetchCartProducts();
  }, []);

  useEffect(() => {
    const simpleCart = cartItems.map(item => ({
      id: item.id,
      quantity: item.quantity
    }));
    localStorage.setItem('cart', JSON.stringify(simpleCart));
  }, [cartItems]);

  // محاسبه مبالغ (قبل از استفاده در JSX)
  const subtotal = cartItems.reduce((total, item) => {
    const price = Number(item.discountPrice || item.discount_price || item.price || 0);
    return total + price * item.quantity;
  }, 0);

  const shippingCost = subtotal > 5000000 ? 0 : 150000;
  const totalAmount = subtotal + shippingCost; // تعریف totalAmount اینجا

  const removeItem = (id) => {
    setCartItems(cartItems.filter((item) => item.id !== id));
  };

const updateQuantity = async (id, newQuantity) => {
  if (newQuantity <= 0) return;

  // بررسی موجودی از دیتابیس
  const res = await fetch(`/api/products?id=${id}`);
  const data = await res.json();

  if (!data.product) {
    toast.error('محصول یافت نشد!', {
      position: "top-right",
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
    });
    return;
  }

  const stockQuantity = data.product.stock_quantity;

  if (newQuantity > stockQuantity) {
    toast.warn(`موجودی کافی نیست! فقط ${stockQuantity} عدد موجود است.`, {
      position: "top-right",
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
    });
    return;
  }

  // به‌روزرسانی تعداد در سبد خرید
  setCartItems(
    cartItems.map((item) =>
      item.id === id ? { ...item, quantity: newQuantity } : item
    )
  );

  toast.success('تعداد محصول با موفقیت به‌روزرسانی شد!', {
    position: "top-right",
    autoClose: 3000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    progress: undefined,
  });
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
          <button
            className="inline-flex items-center px-6 py-3 bg-[#0F2C59] text-white rounded-lg hover:bg-[#0F2C59]/90 transition"
            onClick={() => router.push('/products')}
          >
            <span>مشاهده محصولات</span>
            <HiArrowRight className="mr-2" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
    <Header/>
    <ToastContainer />
    <CheckoutModal
      isOpen={showCheckoutModal}
      onClose={() => setShowCheckoutModal(false)}
      cartItems={cartItems}
      totalAmount={totalAmount}
    />
      <div className="bg-white min-h-screen px-4 py-12">
      <div className="max-w-6xl mx-auto">
        {/* هدر سبد خرید با دکمه بازگشت */}
        <div className="flex items-center justify-between mb-8 border-b border-[#0F2C59]/10 pb-4">
          <h1 className="text-3xl font-bold text-[#0F2C59] text-right">سبد خرید شما</h1>

          <div className="flex items-center gap-4 text-[#0F2C59]">
            {/* دکمه بازگشت سمت چپ (یا راست در حالت RTL) */}
            <button
              onClick={() => router.back()}
              className="hover:text-[#0F2C59]/80 transition text-sm flex items-center gap-1"
            >
              <HiArrowRight className="w-5 h-5" />
              بازگشت
            </button>

            {/* تعداد محصولات */}
            <div className="flex items-center gap-1">
              <HiShoppingCart className="w-6 h-6" />
              <span className="text-sm">{cartItems.length} محصول</span>
            </div>
          </div>
        </div>


        {/* محتوای سبد خرید */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {cartItems.map((item) => (
              <CartCard
                key={item.id}
                item={item}
                onRemove={removeItem}
                onUpdateQuantity={updateQuantity}
              />
            ))}
          </div>

          {/* خلاصه سفارش */}
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

            <button 
              className="w-full bg-[#0F2C59] text-white py-4 rounded-lg hover:bg-[#0F2C59]/90 transition flex justify-center items-center gap-2 shadow-lg shadow-[#0F2C59]/20"
              onClick={() => setShowCheckoutModal(true)} // تغییر onClick
            >
              <HiShoppingCart size={20} /> ادامه خرید
            </button>


            <button
              className="block mt-4 w-full text-center text-[#0F2C59] py-2 border border-[#0F2C59]/20 rounded-lg hover:bg-[#0F2C59]/5 transition text-sm"
              onClick={() => router.push('/products')}
            >
              بازگشت به فروشگاه
            </button>
          </div>
        </div>
      </div>
    </div>
    </>
  );
}