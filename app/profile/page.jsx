'use client'
import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useRouter } from 'next/navigation'
import AddressForm from '../components/AddressForm'
import {
  UserIcon,
  PhoneIcon,
  ShoppingBagIcon,
  Cog6ToothIcon,
  CheckIcon,
  PencilIcon,
  ArrowLeftOnRectangleIcon,
  EnvelopeIcon,
  XMarkIcon,
  MapPinIcon,
  TrashIcon,
  PlusIcon
} from '@heroicons/react/24/outline'
import { motion } from 'framer-motion'

const ProfilePage = () => {
  const { user, loading, logout, updateUser, isAuthenticated } = useAuth()
  const router = useRouter()
  const [isEditing, setIsEditing] = useState(false)
  const [editData, setEditData] = useState({})
  const [updating, setUpdating] = useState(false)
  const [showAddressForm, setShowAddressForm] = useState(false)
  const [userAddresses, setUserAddresses] = useState([])
  const [loadingAddresses, setLoadingAddresses] = useState(true)

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login')
    }
  }, [loading, isAuthenticated, router])

  useEffect(() => {
    if (user) {
      setEditData({
        fullName: user.fullName || '',
        email: user.email || '',
        phoneNumber: user.phoneNumber || ''
      })
    }
  }, [user])

  // بارگذاری آدرس‌های کاربر
  const loadUserAddresses = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      console.log('❌ توکن یافت نشد');
      setLoadingAddresses(false);
      return;
    }

    try {
      console.log('🔄 شروع بارگذاری آدرس‌ها...');
      setLoadingAddresses(true);
      
      const response = await fetch('/api/addresses', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('📡 پاسخ سرور:', response.status);

      if (response.ok) {
        const result = await response.json();
        console.log('📋 آدرس‌های دریافت شده:', result);
        
        if (result.success) {
          setUserAddresses(result.data || []);
          console.log('✅ آدرس‌ها با موفقیت بارگذاری شدند:', result.data.length);
        } else {
          console.error('❌ خطا از سرور:', result.error);
          setUserAddresses([]);
        }
      } else {
        console.error('❌ HTTP error:', response.status);
        setUserAddresses([]);
      }
    } catch (error) {
      console.error('❌ خطا در بارگذاری آدرس‌ها:', error);
      setUserAddresses([]);
    } finally {
      setLoadingAddresses(false);
    }
  };

  // بارگذاری آدرس‌ها هنگام لود شدن کامپوننت
  useEffect(() => {
    if (user && !loading) {
      console.log('👤 کاربر موجود، شروع بارگذاری آدرس‌ها...');
      loadUserAddresses();
    }
  }, [user, loading]);

  // تابع handleAddAddress
  const handleAddAddress = async (addressData) => {
    console.log('📝 ارسال آدرس جدید:', addressData);
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('لطفا دوباره وارد شوید');
        return;
      }

      const response = await fetch('/api/addresses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(addressData)
      });

      console.log('📡 پاسخ سرور POST:', response.status);
      
      const data = await response.json();
      console.log('📋 داده‌های پاسخ POST:', data);
      
      if (response.ok && data.success) {
        console.log('✅ آدرس با موفقیت اضافه شد');
        
        setUserAddresses(prev => [data.data, ...prev]);
        setShowAddressForm(false);
        alert('آدرس با موفقیت اضافه شد!');
        
        setTimeout(() => {
          const addressSection = document.getElementById('addresses');
          if (addressSection) {
            addressSection.scrollIntoView({ 
              behavior: 'smooth', 
              block: 'start' 
            });
          }
        }, 100);
        
      } else {
        console.error('❌ خطا از سرور:', data.error || data.message);
        alert(data.error || data.message || 'خطا در ثبت آدرس');
      }
    } catch (error) {
      console.error('❌ خطا در درخواست POST:', error);
      alert('خطا در ثبت آدرس');
    }
  };

  // حذف آدرس
  const handleDeleteAddress = async (addressId) => {
    if (!confirm('آیا از حذف این آدرس اطمینان دارید؟')) return;
    
    console.log('🗑️ حذف آدرس:', addressId);
    
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`/api/addresses/${addressId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('📡 پاسخ سرور DELETE:', response.status);

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          console.log('✅ آدرس حذف شد');
          setUserAddresses(prev => prev.filter(addr => addr.id !== addressId));
          alert('آدرس با موفقیت حذف شد');
        } else {
          alert(result.error || 'خطا در حذف آدرس');
        }
      } else {
        alert('خطا در حذف آدرس');
      }
    } catch (error) {
      console.error('❌ خطا در حذف آدرس:', error);
      alert('خطا در حذف آدرس');
    }
  };

  const handleSave = async () => {
  console.log('📤 ارسال داده‌ها:', editData) // ⭐ اضافه کردن log
  setUpdating(true)
  try {
    const token = localStorage.getItem('token')
    const response = await fetch('/api/auth/update-profile', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(editData)
    })

    const data = await response.json()
    console.log('📥 پاسخ دریافتی:', data) // ⭐ اضافه کردن log

    if (data.success) {
      updateUser(data.user)
      setIsEditing(false)
      alert('پروفایل با موفقیت بروزرسانی شد') // ⭐ اضافه کردن تأیید
    } else {
      alert(data.message || 'خطا در بروزرسانی پروفایل')
    }
  } catch (error) {
    console.error('خطا در بروزرسانی:', error)
    alert('خطا در بروزرسانی پروفایل')
  } finally {
    setUpdating(false)
  }
}

  const handleCancel = () => {
    setEditData({
      fullName: user.fullName || '',
      email: user.email || '',
      phoneNumber: user.phoneNumber || ''
    })
    setIsEditing(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center" style={{ fontFamily: 'Vazirmatn, system-ui, sans-serif', direction: 'rtl' }}>
        <div className="flex flex-col items-center space-y-4">
          <div className="w-8 h-8 border-2 border-[#0F2C59] border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-600 text-sm">در حال بارگذاری...</p>
        </div>
      </div>
    )
  }

  if (!user) return null

  return (
    <div className="min-h-screen bg-gray-50 py-8" style={{ fontFamily: 'Vazirmatn, system-ui, sans-serif', direction: 'rtl' }}>
      <div className="max-w-6xl mx-auto px-6">
        
        {/* Header Section */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4 space-x-reverse">
              <div className="w-16 h-16 bg-[#0F2C59] rounded-lg flex items-center justify-center">
                <UserIcon className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">{user.fullName || user.username}</h1>
                <p className="text-sm text-gray-600">{user.email}</p>
                <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-[#0F2C59] text-white mt-1">
                  {user.role === 'admin' ? 'مدیر سیستم' : 'کاربر'}
                </span>
              </div>
            </div>

            <div className="flex space-x-3 space-x-reverse">
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center px-4 py-2 bg-[#0F2C59] text-white rounded-md hover:bg-[#0F2C59]/90 transition-colors text-sm"
                >
                  <PencilIcon className="w-4 h-4 ml-2" />
                  ویرایش
                </button>
              ) : (
                <>
                  <button
                    onClick={handleSave}
                    disabled={updating}
                    className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors disabled:opacity-50 text-sm"
                  >
                    <CheckIcon className="w-4 h-4 ml-2" />
                    {updating ? 'در حال ذخیره...' : 'ذخیره'}
                  </button>
                  <button
                    onClick={handleCancel}
                    className="flex items-center px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors text-sm"
                  >
                    <XMarkIcon className="w-4 h-4 ml-2" />
                    انصراف
                  </button>
                </>
              )}
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Main Content */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-2 space-y-6"
          >
            
            {/* Personal Information */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                <UserIcon className="w-5 h-5 ml-2 text-[#0F2C59]" />
                اطلاعات شخصی
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Full Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    نام کامل
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editData.fullName}
                      onChange={(e) => setEditData({...editData, fullName: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0F2C59] focus:border-transparent"
                      placeholder="نام کامل"
                    />
                  ) : (
                    <div className="flex items-center px-3 py-2 bg-gray-50 border border-gray-200 rounded-md">
                      <UserIcon className="w-4 h-4 text-gray-400 ml-2" />
                      <span className="text-gray-900">{user.fullName || 'تعریف نشده'}</span>
                    </div>
                  )}
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ایمیل
                  </label>
                  {isEditing ? (
                    <input
                      type="email"
                      value={editData.email}
                      onChange={(e) => setEditData({...editData, email: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0F2C59] focus:border-transparent"
                      placeholder="ایمیل"
                    />
                  ) : (
                    <div className="flex items-center px-3 py-2 bg-gray-50 border border-gray-200 rounded-md">
                      <EnvelopeIcon className="w-4 h-4 text-gray-400 ml-2" />
                      <span className="text-gray-900">{user.email}</span>
                    </div>
                  )}
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    شماره تلفن
                  </label>
                  {isEditing ? (
                    <input
                      type="tel"
                      value={editData.phoneNumber}
                      onChange={(e) => setEditData({...editData, phoneNumber: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0F2C59] focus:border-transparent"
                      placeholder="شماره تلفن"
                    />
                  ) : (
                    <div className="flex items-center px-3 py-2 bg-gray-50 border border-gray-200 rounded-md">
                      <PhoneIcon className="w-4 h-4 text-gray-400 ml-2" />
                      <span className="text-gray-900">{user.phoneNumber || 'تعریف نشده'}</span>
                    </div>
                  )}
                </div>

                {/* Username */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    نام کاربری
                  </label>
                  <div className="flex items-center justify-between px-3 py-2 bg-gray-100 border border-gray-200 rounded-md">
                    <div className="flex items-center">
                      <UserIcon className="w-4 h-4 text-gray-400 ml-2" />
                      <span className="text-gray-900">{user.username}</span>
                    </div>
                    <span className="text-xs text-gray-500 bg-gray-200 px-2 py-1 rounded">
                      غیر قابل تغییر
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Addresses Section */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6" id="addresses">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <MapPinIcon className="w-5 h-5 ml-2 text-[#0F2C59]" />
                  آدرس‌های من
                </h3>
                <button
                  onClick={() => setShowAddressForm(prev => !prev)}
                  className="flex items-center px-3 py-2 bg-[#0F2C59] text-white rounded-md hover:bg-[#0F2C59]/90 transition-colors text-sm"
                >
                  {showAddressForm ? (
                    <>
                      <XMarkIcon className="w-4 h-4 ml-1" />
                      انصراف
                    </>
                  ) : (
                    <>
                      <PlusIcon className="w-4 h-4 ml-1" />
                      افزودن آدرس
                    </>
                  )}
                </button>
              </div>

              {/* Address Form */}
              {showAddressForm && (
                <div className="mb-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
                  <AddressForm onSubmit={handleAddAddress} showSavedAddresses={false} />
                </div>
              )}

              {/* Address List */}
              <div className="space-y-4">
                {loadingAddresses ? (
                  <div className="text-center py-8">
                    <div className="w-6 h-6 border-2 border-[#0F2C59] border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                    <p className="text-gray-500 text-sm">در حال بارگذاری آدرس‌ها...</p>
                  </div>
                ) : userAddresses && userAddresses.length > 0 ? (
                  userAddresses.map((address, index) => (
                    <motion.div 
                      key={address.id || index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-3 space-x-reverse flex-1">
                          <div className="w-8 h-8 bg-[#0F2C59] rounded-md flex items-center justify-center flex-shrink-0">
                            <MapPinIcon className="w-4 h-4 text-white" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 space-x-reverse mb-2">
                              <span className="font-medium text-gray-900">آدرس {index + 1}</span>
                              <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                                {address.city} - {address.state || 'نامشخص'}
                              </span>
                            </div>
                            <p className="text-gray-700 text-sm mb-3 leading-relaxed">{address.address}</p>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs text-gray-600">
                              {address.house_no && (
                                <span>پلاک: {address.house_no}</span>
                              )}
                              {address.postalcode && (
                                <span>کدپستی: {address.postalcode}</span>
                              )}
                              <span>تلفن: {address.phone_number}</span>
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={() => handleDeleteAddress(address.id)}
                          className="text-red-500 hover:text-red-700 p-1"
                          title="حذف آدرس"
                        >
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <MapPinIcon className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm">هنوز آدرسی ثبت نکرده‌اید</p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>

          {/* Sidebar */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-6"
          >
            
            {/* Quick Stats */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">آمار کلی</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-[#0F2C59] text-white rounded-md">
                  <div className="flex items-center">
                    <MapPinIcon className="w-4 h-4 ml-2" />
                    <span className="text-sm font-medium">آدرس‌ها</span>
                  </div>
                  <span className="font-bold">{userAddresses.length}</span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">دسترسی سریع</h3>
              <div className="space-y-2">
                <button
                  onClick={() => router.push('/orders')}
                  className="w-full flex items-center p-3 text-gray-700 hover:bg-gray-50 rounded-md transition-colors"
                >
                  <ShoppingBagIcon className="w-4 h-4 ml-3" />
                  <span className="text-sm">سفارشات من</span>
                </button>
                
                <button
                  onClick={() => router.push('/settings')}
                  className="w-full flex items-center p-3 text-gray-700 hover:bg-gray-50 rounded-md transition-colors"
                >
                  <Cog6ToothIcon className="w-4 h-4 ml-3" />
                  <span className="text-sm">تنظیمات</span>
                </button>
                
                <button
                  onClick={logout}
                  className="w-full flex items-center p-3 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                >
                  <ArrowLeftOnRectangleIcon className="w-4 h-4 ml-3" />
                  <span className="text-sm">خروج از حساب</span>
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

export default ProfilePage