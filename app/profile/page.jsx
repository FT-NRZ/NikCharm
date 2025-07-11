'use client'
import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useRouter } from 'next/navigation'

import {
  HiOutlineUser,
  HiOutlinePhone,
  HiOutlineShoppingBag,
  HiOutlineCog,
  HiOutlineCheck
} from 'react-icons/hi2'

import {
  HiPencil,
  HiLogout,
  HiOutlineMail,
  HiX
} from 'react-icons/hi'

import { motion } from 'framer-motion'

const ProfilePage = () => {
  const { user, loading, logout, updateUser, isAuthenticated } = useAuth()
  const router = useRouter()
  const [isEditing, setIsEditing] = useState(false)
  const [editData, setEditData] = useState({})
  const [updating, setUpdating] = useState(false)

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

  const handleSave = async () => {
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

      if (data.success) {
        updateUser(data.user)
        setIsEditing(false)
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
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-16 h-16 border-4 border-slate-600 border-t-white rounded-full animate-spin"></div>
          <div className="text-white text-lg font-medium">در حال بارگذاری...</div>
        </div>
      </div>
    )
  }

  if (!user) return null

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-4 sm:py-8" dir="rtl">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-4 sm:p-8 mb-6 sm:mb-8 border border-slate-200/50"
        >
          <div className="flex flex-col sm:flex-row items-center justify-between space-y-6 sm:space-y-0">
            <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6 sm:space-x-reverse">
              <div className="relative">
                <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-r from-slate-700 via-slate-600 to-slate-800 rounded-full flex items-center justify-center shadow-lg">
                  <HiOutlineUser size={32} className="text-white" />
                </div>
                <div className="absolute -bottom-2 -right-2 w-6 h-6 bg-green-500 rounded-full border-2 border-white shadow-lg"></div>
              </div>
              <div className="text-center sm:text-right">
                <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2">
                  {user.fullName || user.username}
                </h1>
                <p className="text-slate-600 mb-3 text-sm sm:text-base">{user.email}</p>
                <span className="inline-block px-4 py-2 bg-gradient-to-r from-slate-700 to-slate-600 text-white text-sm rounded-full shadow-lg">
                  {user.role === 'admin' ? 'مدیر' : 'مشتری'}
                </span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 sm:space-x-reverse w-full sm:w-auto">
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center justify-center px-6 py-3 bg-gradient-to-r from-slate-700 to-slate-600 text-white rounded-xl hover:from-slate-600 hover:to-slate-500 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  <HiPencil size={18} className="ml-2" />
                  ویرایش پروفایل
                </button>
              ) : (
                <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 sm:space-x-reverse">
                  <button
                    onClick={handleSave}
                    disabled={updating}
                    className="flex items-center justify-center px-6 py-3 bg-gradient-to-r from-green-600 to-green-500 text-white rounded-xl hover:from-green-500 hover:to-green-400 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <HiOutlineCheck size={18} className="ml-2" />
                    {updating ? 'در حال ذخیره...' : 'ذخیره'}
                  </button>
                  <button
                    onClick={handleCancel}
                    className="flex items-center justify-center px-6 py-3 bg-gradient-to-r from-slate-500 to-slate-400 text-white rounded-xl hover:from-slate-400 hover:to-slate-300 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                  >
                    <HiX size={18} className="ml-2" />
                    انصراف
                  </button>
                </div>
              )}
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
          {/* Profile Info */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-2 bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-6 sm:p-8 border border-slate-200/50"
          >
            <div className="flex items-center mb-8">
              <div className="w-1 h-8 bg-gradient-to-b from-slate-700 to-slate-500 rounded-full ml-4"></div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900">اطلاعات شخصی</h2>
            </div>
            
            <div className="space-y-8">
              {/* Full Name */}
              <div className="group">
                <label className="block text-sm font-semibold text-slate-700 mb-3">نام کامل</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={editData.fullName}
                    onChange={(e) => setEditData({...editData, fullName: e.target.value})}
                    className="w-full px-5 py-4 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-all duration-300 bg-white/80 backdrop-blur-sm shadow-sm text-slate-900 placeholder-slate-400"
                    placeholder="نام کامل خود را وارد کنید"
                  />
                ) : (
                  <div className="flex items-center px-5 py-4 bg-gradient-to-r from-slate-50 to-slate-100 rounded-xl border border-slate-200/50 group-hover:shadow-md transition-all duration-300">
                    <div className="w-10 h-10 bg-gradient-to-r from-slate-600 to-slate-500 rounded-lg flex items-center justify-center ml-4 shadow-sm">
                      <HiOutlineUser className="text-white" size={18} />
                    </div>
                    <span className="text-slate-800 font-medium">{user.fullName || 'تعریف نشده'}</span>
                  </div>
                )}
              </div>

              {/* Email */}
              <div className="group">
                <label className="block text-sm font-semibold text-slate-700 mb-3">ایمیل</label>
                {isEditing ? (
                  <input
                    type="email"
                    value={editData.email}
                    onChange={(e) => setEditData({...editData, email: e.target.value})}
                    className="w-full px-5 py-4 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-all duration-300 bg-white/80 backdrop-blur-sm shadow-sm text-slate-900 placeholder-slate-400"
                    placeholder="ایمیل خود را وارد کنید"
                  />
                ) : (
                  <div className="flex items-center px-5 py-4 bg-gradient-to-r from-slate-50 to-slate-100 rounded-xl border border-slate-200/50 group-hover:shadow-md transition-all duration-300">
                    <div className="w-10 h-10 bg-gradient-to-r from-slate-600 to-slate-500 rounded-lg flex items-center justify-center ml-4 shadow-sm">
                      <HiOutlineMail className="text-white" size={18} />
                    </div>
                    <span className="text-slate-800 font-medium">{user.email}</span>
                  </div>
                )}
              </div>

              {/* Phone */}
              <div className="group">
                <label className="block text-sm font-semibold text-slate-700 mb-3">شماره تلفن</label>
                {isEditing ? (
                  <input
                    type="tel"
                    value={editData.phoneNumber}
                    onChange={(e) => setEditData({...editData, phoneNumber: e.target.value})}
                    className="w-full px-5 py-4 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-all duration-300 bg-white/80 backdrop-blur-sm shadow-sm text-slate-900 placeholder-slate-400"
                    placeholder="شماره تلفن خود را وارد کنید"
                  />
                ) : (
                  <div className="flex items-center px-5 py-4 bg-gradient-to-r from-slate-50 to-slate-100 rounded-xl border border-slate-200/50 group-hover:shadow-md transition-all duration-300">
                    <div className="w-10 h-10 bg-gradient-to-r from-slate-600 to-slate-500 rounded-lg flex items-center justify-center ml-4 shadow-sm">
                      <HiOutlinePhone className="text-white" size={18} />
                    </div>
                    <span className="text-slate-800 font-medium">{user.phoneNumber || 'تعریف نشده'}</span>
                  </div>
                )}
              </div>

              {/* Username */}
              <div className="group">
                <label className="block text-sm font-semibold text-slate-700 mb-3">نام کاربری</label>
                <div className="flex items-center px-5 py-4 bg-gradient-to-r from-slate-100 to-slate-200 rounded-xl border border-slate-300/50 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 w-full h-full opacity-50"></div>
                  <div className="w-10 h-10 bg-gradient-to-r from-slate-500 to-slate-400 rounded-lg flex items-center justify-center ml-4 shadow-sm relative z-10">
                    <HiOutlineUser className="text-white" size={18} />
                  </div>
                  <span className="text-slate-800 font-medium relative z-10">{user.username}</span>
                  <span className="mr-auto text-xs text-slate-500 bg-slate-200 px-3 py-1 rounded-full font-medium relative z-10">غیر قابل تغییر</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Quick Actions */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-6 sm:space-y-8"
          >
            {/* Stats */}
            <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-6 border border-slate-200/50">
              <div className="flex items-center mb-6">
                <div className="w-1 h-6 bg-gradient-to-b from-slate-700 to-slate-500 rounded-full ml-3"></div>
                <h3 className="text-lg font-bold text-slate-900">آمار سریع</h3>
              </div>
              <div className="space-y-4">
                <div className="group relative overflow-hidden">
                  <div className="flex items-center justify-between p-4 bg-gradient-to-r from-slate-700 to-slate-600 rounded-xl text-white shadow-lg group-hover:shadow-xl transition-all duration-300 transform group-hover:-translate-y-0.5">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center ml-4">
                        <HiOutlineShoppingBag className="text-white" size={20} />
                      </div>
                      <span className="font-medium">سفارشات</span>
                    </div>
                    <div className="text-2xl font-bold">12</div>
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 w-full h-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>
              </div>
            </div>

            {/* Shortcuts */}
            <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-6 border border-slate-200/50">
              <div className="flex items-center mb-6">
                <div className="w-1 h-6 bg-gradient-to-b from-slate-700 to-slate-500 rounded-full ml-3"></div>
                <h3 className="text-lg font-bold text-slate-900">دسترسی سریع</h3>
              </div>
              <div className="space-y-3">
                <button
                  onClick={() => router.push('/orders')}
                  className="w-full group relative overflow-hidden"
                >
                  <div className="flex items-center p-4 text-slate-700 hover:text-white bg-gradient-to-r from-slate-100 to-slate-200 hover:from-slate-600 hover:to-slate-500 rounded-xl transition-all duration-300 shadow-sm hover:shadow-lg transform hover:-translate-y-0.5">
                    <div className="w-10 h-10 bg-slate-300 group-hover:bg-white/20 rounded-lg flex items-center justify-center ml-4 transition-all duration-300">
                      <HiOutlineShoppingBag size={20} />
                    </div>
                    <span className="font-medium">سفارشات من</span>
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 w-full h-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </button>

                <button
                  onClick={() => router.push('/settings')}
                  className="w-full group relative overflow-hidden"
                >
                  <div className="flex items-center p-4 text-slate-700 hover:text-white bg-gradient-to-r from-slate-100 to-slate-200 hover:from-slate-600 hover:to-slate-500 rounded-xl transition-all duration-300 shadow-sm hover:shadow-lg transform hover:-translate-y-0.5">
                    <div className="w-10 h-10 bg-slate-300 group-hover:bg-white/20 rounded-lg flex items-center justify-center ml-4 transition-all duration-300">
                      <HiOutlineCog size={20} />
                    </div>
                    <span className="font-medium">تنظیمات</span>
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 w-full h-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </button>

                <button
                  onClick={logout}
                  className="w-full group relative overflow-hidden"
                >
                  <div className="flex items-center p-4 text-red-600 hover:text-white bg-gradient-to-r from-red-50 to-red-100 hover:from-red-600 hover:to-red-500 rounded-xl transition-all duration-300 shadow-sm hover:shadow-lg transform hover:-translate-y-0.5">
                    <div className="w-10 h-10 bg-red-200 group-hover:bg-white/20 rounded-lg flex items-center justify-center ml-4 transition-all duration-300">
                      <HiLogout size={20} />
                    </div>
                    <span className="font-medium">خروج از حساب</span>
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 w-full h-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
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