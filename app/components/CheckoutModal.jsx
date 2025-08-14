// app/components/CheckoutModal.jsx را کاملاً با این جایگزین کن:

'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useRouter } from 'next/navigation';
import {
  HiX,
  HiOutlineUser,
  HiOutlinePhone,
  HiOutlineMail,
  HiOutlineLocationMarker,
  HiOutlineHome,
  HiPencilAlt,
  HiShoppingCart,
  HiCheckCircle
} from 'react-icons/hi';

const CheckoutModal = ({ isOpen, onClose, cartItems, totalAmount }) => {
  const { user } = useAuth();
  const router = useRouter();
  const [userAddresses, setUserAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen && user) {
      fetchUserAddresses();
    }
  }, [isOpen, user]);

  const fetchUserAddresses = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/addresses', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      const data = await response.json();
      console.log('📋 آدرس‌های دریافت شده:', data);
      
      if (data.success && data.data) {
        setUserAddresses(data.data);
        if (data.data.length > 0) {
          setSelectedAddress(data.data[0]);
        }
      } else {
        setUserAddresses([]);
      }
    } catch (error) {
      console.error('❌ خطا در دریافت آدرس‌ها:', error);
      setUserAddresses([]);
    } finally {
      setLoading(false);
    }
  };

  const handleOrderSubmit = async () => {
    if (!user) {
      alert('ابتدا وارد حساب کاربری خود شوید');
      router.push('/login');
      return;
    }

    if (!selectedAddress) {
      alert('لطفاً آدرس تحویل را انتخاب کنید');
      return;
    }

    setSubmitting(true);
  try {
    const token = localStorage.getItem('token');
    
    // آماده سازی داده‌های سفارش
    const orderData = {
      items: cartItems.map(item => ({
        product_id: item.id,
        name: item.name,
        price: item.discountPrice || item.discount_price || item.price,
        quantity: item.quantity
      })),
      total_amount: totalAmount,
      delivery_address: selectedAddress.address,
      phone_number: selectedAddress.phone_number || user.phoneNumber,
      address_id: selectedAddress.id
    };

    // ایجاد سفارش
    const response = await fetch('/api/orders/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(orderData)
    });

    const result = await response.json();

    if (result.success) {
      // پاک کردن سبد خرید
      localStorage.removeItem('cart');
      
      alert(`سفارش ${result.order.order_number} با موفقیت ثبت شد!`);
      
      setSubmitting(false);
      onClose();
      
      // انتقال به صفحه سفارشات
      router.push('/orders');
    } else {
      throw new Error(result.error);
    }

  } catch (error) {
    console.error('خطا در ثبت سفارش:', error);
    alert('خطا در ثبت سفارش: ' + error.message);
    setSubmitting(false);
  }
};

  const formatPrice = (price) => {
    return new Intl.NumberFormat('fa-IR').format(price) + ' تومان';
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      {/* پس‌زمینه تار */}
      <div 
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      ></div>

      {/* Modal Content */}
      <div className="relative bg-white w-full sm:max-w-2xl lg:max-w-4xl h-full sm:h-auto sm:max-h-[95vh] sm:rounded-2xl overflow-hidden animate-in slide-in-from-bottom sm:zoom-in-95 duration-300">
        
        {/* Header کوچک‌تر */}
        <div className="relative bg-gradient-to-r from-[#0F2C59] to-[#1e3a8a] text-white p-4 sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold flex items-center">
                <HiShoppingCart className="ml-2" />
                تکمیل خرید
              </h2>
              <p className="text-white/90 text-sm sm:text-base mt-1">بررسی و تکمیل سفارش</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-full transition-all"
            >
              <HiX className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
          </div>
        </div>

        {/* Content با scroll بهتر */}
        <div className="overflow-y-auto h-[calc(100vh-140px)] sm:h-auto sm:max-h-[60vh]">
          <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
            
            {/* اطلاعات کاربر - کامپکت */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-[#0F2C59] flex items-center">
                  <div className="w-8 h-8 bg-[#0F2C59] rounded-full flex items-center justify-center ml-2">
                    <HiOutlineUser className="w-4 h-4 text-white" />
                  </div>
                  اطلاعات شخصی
                </h3>
                <button
                  onClick={() => {
                    onClose();
                    router.push('/profile');
                  }}
                  className="flex items-center px-3 py-1.5 text-xs bg-white text-[#0F2C59] rounded-lg hover:bg-gray-50 transition-all border border-[#0F2C59]/20"
                >
                  <HiPencilAlt className="ml-1 w-3 h-3" />
                  ویرایش
                </button>
              </div>

              <div className="grid grid-cols-1 gap-3">
                <div className="flex items-center bg-white/80 rounded-lg p-3">
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center ml-3">
                    <HiOutlineUser className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">نام</p>
                    <p className="font-medium text-sm">{user?.fullName || user?.full_name || 'تعریف نشده'}</p>
                  </div>
                </div>

                <div className="flex items-center bg-white/80 rounded-lg p-3">
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center ml-3">
                    <HiOutlineMail className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">ایمیل</p>
                    <p className="font-medium text-sm">{user?.email}</p>
                  </div>
                </div>

                <div className="flex items-center bg-white/80 rounded-lg p-3">
                  <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center ml-3">
                    <HiOutlinePhone className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">تلفن</p>
                    <p className="font-medium text-sm">{user?.phoneNumber || user?.phone_number || 'تعریف نشده'}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* آدرس - کامپکت */}
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 border border-green-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-[#0F2C59] flex items-center">
                  <div className="w-8 h-8 bg-[#0F2C59] rounded-full flex items-center justify-center ml-2">
                    <HiOutlineLocationMarker className="w-4 h-4 text-white" />
                  </div>
                  آدرس تحویل
                </h3>
                <button
                  onClick={() => {
                    onClose();
                    router.push('/profile');
                  }}
                  className="flex items-center px-3 py-1.5 text-xs bg-white text-[#0F2C59] rounded-lg hover:bg-gray-50 transition-all border border-[#0F2C59]/20"
                >
                  <HiOutlineHome className="ml-1 w-3 h-3" />
                  افزودن
                </button>
              </div>

              {loading ? (
                <div className="text-center py-6">
                  <div className="inline-block w-6 h-6 border-2 border-[#0F2C59] border-t-transparent rounded-full animate-spin"></div>
                  <p className="text-xs text-gray-600 mt-2">بارگذاری آدرس‌ها...</p>
                </div>
              ) : userAddresses.length === 0 ? (
                <div className="text-center py-6">
                  <div className="w-12 h-12 bg-[#0F2C59]/10 rounded-full flex items-center justify-center mx-auto mb-3">
                    <HiOutlineHome className="w-6 h-6 text-[#0F2C59]" />
                  </div>
                  <p className="text-gray-600 mb-3 text-sm">آدرسی ثبت نشده</p>
                  <button
                    onClick={() => {
                      onClose();
                      router.push('/profile');
                    }}
                    className="px-4 py-2 bg-[#0F2C59] text-white rounded-lg hover:bg-[#0F2C59]/90 transition-all text-sm"
                  >
                    افزودن آدرس
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {userAddresses.map((address, index) => (
                    <div
                      key={address.id}
                      className={`p-3 rounded-lg border cursor-pointer transition-all ${
                        selectedAddress?.id === address.id
                          ? 'border-[#0F2C59] bg-[#0F2C59]/5'
                          : 'border-gray-200 bg-white hover:border-[#0F2C59]/50'
                      }`}
                      onClick={() => setSelectedAddress(address)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center mb-2">
                            <span className="font-medium text-sm">آدرس {index + 1}</span>
                            {selectedAddress?.id === address.id && (
                              <span className="mr-2 px-2 py-1 text-xs bg-[#0F2C59] text-white rounded">
                                انتخاب شده
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-700 mb-2">{address.address}</p>
                          <div className="text-xs text-gray-600 space-y-1">
                            <p>🏙️ {address.city}</p>
                            {address.house_no && <p>🏠 پلاک: {address.house_no}</p>}
                            {address.postalcode && <p>📮 کدپستی: {address.postalcode}</p>}
                            {address.phone_number && <p>📞 تلفن: {address.phone_number}</p>}
                          </div>
                        </div>
                        {selectedAddress?.id === address.id && (
                          <div className="w-6 h-6 bg-[#0F2C59] rounded-full flex items-center justify-center">
                            <HiCheckCircle className="w-4 h-4 text-white" />
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* خلاصه سفارش - کامپکت */}
            <div className="bg-gradient-to-br from-gray-50 to-slate-100 rounded-xl p-4 border border-gray-200">
              <h3 className="text-lg font-bold text-[#0F2C59] mb-4 flex items-center">
                <div className="w-8 h-8 bg-[#0F2C59] rounded-full flex items-center justify-center ml-2">
                  <HiShoppingCart className="w-4 h-4 text-white" />
                </div>
                خلاصه سفارش
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between items-center py-2 border-b border-gray-200">
                  <span className="text-gray-600">تعداد محصولات:</span>
                  <span className="font-bold text-[#0F2C59]">{cartItems.length} عدد</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-200">
                  <span className="text-gray-600">مبلغ کل:</span>
                  <span className="font-bold text-[#0F2C59]">{formatPrice(totalAmount - (totalAmount > 5000000 ? 0 : 150000))}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-200">
                  <span className="text-gray-600">هزینه ارسال:</span>
                  <span className="font-bold text-green-600">
                    {totalAmount > 5000000 ? 'رایگان 🎉' : formatPrice(150000)}
                  </span>
                </div>
                <div className="flex justify-between items-center pt-3 text-base font-bold text-[#0F2C59]">
                  <span>مبلغ نهایی:</span>
                  <span className="text-lg">{formatPrice(totalAmount)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer ثابت */}
        <div className="sticky bottom-0 bg-white border-t-2 border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="flex-1 sm:flex-none px-4 py-3 text-gray-600 hover:text-gray-800 transition-colors rounded-lg hover:bg-gray-100 font-medium text-sm"
            >
              انصراف
            </button>
            
            <button
              onClick={handleOrderSubmit}
              disabled={submitting || !selectedAddress || userAddresses.length === 0}
              className={`flex-2 sm:flex-1 px-6 py-3 rounded-lg font-bold transition-all text-sm ${
                submitting || !selectedAddress || userAddresses.length === 0
                  ? 'bg-gray-400 text-gray-700 cursor-not-allowed'
                  : 'bg-gradient-to-r from-[#0F2C59] to-[#1e3a8a] text-white hover:from-[#0F2C59]/90 hover:to-[#1e3a8a]/90 shadow-lg'
              }`}
            >
              {submitting ? (
                <span className="flex items-center justify-center">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin ml-2"></div>
                  در حال ثبت...
                </span>
              ) : (
                'تایید و ثبت سفارش 🛒'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutModal;