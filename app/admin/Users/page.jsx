'use client';
import React, { useState, useEffect } from 'react';
import { Search, User, Mail, Phone, MapPin, Calendar, Shield, Eye, Edit, Trash2, Filter, RefreshCw } from 'lucide-react';

const UserManagementAdmin = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedUser, setSelectedUser] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [products, setProducts] = useState({});
  const [deletingComment, setDeletingComment] = useState(null);



  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    inactiveUsers: 0,
    adminUsers: 0
  });
  
  const deleteComment = async (commentId) => {
    setDeletingComment(commentId);
    try {
      const token = getAuthToken();
      const response = await fetch('/api/admin/users', { // تغییر URL
        method: 'PUT', // تغییر method به PUT
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          action: 'delete_comment',
          commentId: commentId
        })
      });

      const data = await response.json();
      if (data.success) {
        fetchUsers(); // بروزرسانی لیست کاربران و نظرات
      } else {
        setError(data.message || 'خطا در حذف نظر');
      }
    } catch (error) {
      console.error('خطا در حذف نظر:', error);
      setError('خطا در ارتباط با سرور');
    } finally {
      setDeletingComment(null);
    }
  };

  // تابع برای دریافت token از localStorage
  const getAuthToken = () => {
    if (typeof window === 'undefined') return null;
    
    const token = localStorage.getItem('token');
    console.log('Token from localStorage:', token ? 'found' : 'not found');
    return token;
  };
  // تابع برای دریافت اطلاعات محصول
  const fetchProductDetails = async (productId) => {
    if (!productId) return;
    
    // اگر قبلاً دریافت شده، دوباره دریافت نکن
    if (products[productId]) return;
    
    try {
      const token = getAuthToken();
      const response = await fetch(`/api/products/${productId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const data = await response.json();
      if (data.success) {
        setProducts(prev => ({
          ...prev,
          [productId]: data.product
        }));
      }
    } catch (error) {
      console.error("خطا در دریافت اطلاعات محصول:", error);
    }
  };

  // Fetch users function
  const fetchUsers = async () => {
    console.log("Fetching users...");
    setLoading(true);
    setError(null);
    
    try {
      const token = getAuthToken();
      
      if (!token) {
        console.log("No token found");
        setError('توکن احراز هویت یافت نشد. لطفاً دوباره وارد شوید.');
        setLoading(false);
        return; // جلوگیری از ریدایرکت - فقط خطا نمایش داده می‌شود
      }

      console.log("Making API request with token");
      const response = await fetch('/api/admin/users', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log("API response status:", response.status);
      const data = await response.json();
      console.log("API response data:", data);
      
      if (response.ok && data.success) {
      console.log("Setting users:", data.users.length);
      // ✅ Debug اولین کاربر
      if (data.users.length > 0) {
        console.log('🔍 First user data:', {
          id: data.users[0].id,
          username: data.users[0].username,
          last_login_time: data.users[0].last_login_time,
          login_records: data.users[0].login_records,
          comments: data.users[0].comments?.length || 0
        });
      }
      setUsers(data.users);
      setStats(data.stats);
    }
    } catch (error) {
      console.error('Error fetching users:', error);
      setError('خطا در ارتباط با سرور: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log("Component mounted, fetching users");
    fetchUsers();
  }, []);

  // Filter users based on search and filters
  const filteredUsers = users.filter(user => {
    if (!user) return false;
    
    const matchesSearch = 
      (user.username && user.username.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (user.email && user.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (user.fullName && user.fullName.toLowerCase().includes(searchTerm.toLowerCase())); // ✅ تغییر از full_name به fullName
    
    const matchesRole = roleFilter === 'all' || 
      (user.user_roles && user.user_roles.some(ur => ur.roles && ur.roles.name === roleFilter));
    
    const matchesStatus = statusFilter === 'all' || 
      (statusFilter === 'active' && user.isactive) ||
      (statusFilter === 'inactive' && !user.isactive);
    
    return matchesSearch && matchesRole && matchesStatus;
  });

  const getRoleColor = (role) => {
    switch(role) {
      case 'admin': return 'bg-red-100 text-red-800';
      case 'customer': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Toggle user status
  const toggleUserStatus = async (userId) => {
    try {
      const token = getAuthToken();
      
      if (!token) {
        setError('توکن احراز هویت یافت نشد');
        return;
      }
      
      const response = await fetch('/api/admin/users', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId: userId,
          action: 'toggle_status'
        })
      });

      const data = await response.json();
      
      if (data.success) {
        fetchUsers();
      } else {
        setError(data.message || 'خطا در بروزرسانی وضعیت کاربر');
      }
    } catch (error) {
      console.error('خطا در بروزرسانی وضعیت کاربر:', error);
      setError('خطا در ارتباط با سرور');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'نامشخص';
    return new Date(dateString).toLocaleDateString('fa-IR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };


  const getLastLoginDate = (user) => {
    // بررسی فیلد جدید اول
    if (user.last_login_time) {
      return formatDate(user.last_login_time);
    }
    
    // بررسی login_records
    if (user.login_records && user.login_records.length > 0) {
      const lastLogin = user.login_records[0];
      if (lastLogin.login_time) {
        return formatDate(lastLogin.login_time);
      }
    }
    
    return 'هرگز';
  };

  const UserCard = ({ user }) => (
    <div className={`bg-white rounded-lg shadow-md border border-gray-200 p-6 hover:shadow-lg transition-shadow ${!user.isactive ? 'bg-gray-50 border-gray-300' : ''}`}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3 space-x-reverse">
          <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg ${user.isactive ? 'bg-gradient-to-br from-blue-500 to-purple-600' : 'bg-gray-400'}`}>
            {user.full_name ? user.full_name.charAt(0) : user.username ? user.username.charAt(0) : '?'}
          </div>
          <div>
            <h3 className={`text-lg font-semibold ${user.isactive ? 'text-gray-900' : 'text-gray-500'}`}>
              {user.username || 'بدون نام کاربری'}
            </h3>
            <p className="text-sm text-gray-500">{user.full_name || 'بدون نام'}</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          {user.user_roles && user.user_roles.length > 0 && (
            <span className={`px-3 py-1.5 text-xs font-medium rounded-full shadow-sm ${getRoleColor(user.user_roles[0]?.roles?.name)}`}>
              {user.user_roles[0]?.roles?.name === 'admin' ? 'مدیر' : 'مشتری'}
            </span>
          )}
          <span className={`px-3 py-1.5 text-xs font-medium rounded-full shadow-sm ${user.isactive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            {user.isactive ? 'فعال' : 'غیرفعال'}
          </span>
        </div>
      </div>

      <div className={`space-y-3 ${!user.isactive ? 'opacity-75' : ''}`}>
        {user.email && (
          <div className="flex items-center space-x-3 space-x-reverse text-sm text-gray-600">
            <Mail className="w-4 h-4" />
            <span>{user.email}</span>
          </div>
        )}
        
        {user.phone_number && (
          <div className="flex items-center space-x-3 space-x-reverse text-sm text-gray-600">
            <Phone className="w-4 h-4" />
            <span>{user.phone_number}</span>
          </div>
        )}
        
        <div className="flex items-center space-x-3 space-x-reverse text-sm text-gray-600">
          <Calendar className="w-4 h-4" />
          <span>عضویت: {formatDate(user.created_at)}</span>
        </div>
        
        <div className="flex items-center space-x-3 space-x-reverse text-sm text-gray-600">
          <Calendar className="w-4 h-4" />
          <span>آخرین ورود: {getLastLoginDate(user)}</span>
        </div>
      </div>

      <div className={`mt-4 pt-4 border-t border-gray-200 ${!user.isactive ? 'opacity-75' : ''}`}>
        <div className="flex justify-between items-center text-sm text-gray-500">
          <span>سفارشات: {user._count?.orders || 0}</span>
          <span>نظرات: {user._count?.comments || 0}</span>
          <span>ورودها: {user._count?.login_records || 0}</span>
        </div>
      </div>

      {/* دکمه‌ها - فقط مشاهده و فعال/غیرفعال‌سازی */}
      <div className="mt-6 flex flex-col sm:flex-row justify-center gap-2 sm:space-x-3 sm:space-x-reverse">
        <button
          onClick={() => {
            setSelectedUser(user);
            setShowModal(true);
          }}
          className="px-2 sm:px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all duration-200 shadow-sm hover:shadow-md flex items-center justify-center"
        >
          <Eye className="w-4 h-4 ml-1.5" />
          <span>مشاهده</span>
        </button>
        
        <button
          onClick={() => toggleUserStatus(user.id)}
          className={`px-2 sm:px-4 py-2 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md flex items-center justify-center ${
            user.isactive 
              ? 'bg-amber-500 text-white hover:bg-amber-600' 
              : 'bg-green-500 text-white hover:bg-green-600'
          }`}
        >
          {user.isactive ? 'غیرفعال‌سازی' : 'فعال‌سازی'}
        </button>
      </div>
    </div>
  );

const UserModal = ({ user, onClose }) => {
  const [activeTab, setActiveTab] = useState('profile');
  
  return (
    <div className="fixed inset-0 backdrop-blur-sm bg-black/30 flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="bg-white rounded-xl sm:rounded-2xl w-full max-w-3xl max-h-[90vh] sm:max-h-[85vh] overflow-hidden shadow-xl relative">
        {/* نوار عنوان - کوچکتر در موبایل */}
        <div className="flex justify-between items-center p-3 sm:p-5 bg-gray-50 border-b border-gray-200">
          <h2 className="text-lg sm:text-xl font-bold text-gray-800">جزئیات کاربر</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors focus:outline-none"
          >
            <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>
        
        {/* تب‌ها - کوچکتر در موبایل */}
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab('profile')}
            className={`px-3 sm:px-6 py-2 sm:py-3 font-medium text-xs sm:text-sm ${
              activeTab === 'profile'
                ? 'text-blue-600 border-b-2 border-blue-500'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            پروفایل
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`px-3 sm:px-6 py-2 sm:py-3 font-medium text-xs sm:text-sm flex items-center ${
              activeTab === 'orders'
                ? 'text-blue-600 border-b-2 border-blue-500'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            سفارشات
            <span className="mr-1 sm:mr-2 bg-gray-100 text-gray-700 text-xs px-1.5 py-0.5 rounded-full">
              {user._count?.orders || 0}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('comments')}
            className={`px-3 sm:px-6 py-2 sm:py-3 font-medium text-xs sm:text-sm flex items-center ${
              activeTab === 'comments'
                ? 'text-blue-600 border-b-2 border-blue-500'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            نظرات
            <span className="mr-1 sm:mr-2 bg-gray-100 text-gray-700 text-xs px-1.5 py-0.5 rounded-full">
              {user._count?.comments || 0}
            </span>
          </button>
        </div>
        
        {/* محتوای تب - فضای کمتر در موبایل، ارتفاع محدودتر */}
        <div className="overflow-y-auto p-3 sm:p-6" style={{ maxHeight: 'calc(90vh - 140px)' }}>
          {activeTab === 'profile' && (
            <div className="space-y-4 sm:space-y-6">
              {/* آواتار و نام کاربر - کوچکتر در موبایل */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6">
                <div className={`w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center text-white font-bold text-xl sm:text-2xl mx-auto sm:mx-0 ${user.isactive ? 'bg-gradient-to-br from-blue-500 to-purple-600' : 'bg-gray-400'}`}>
                  {user.full_name ? user.full_name.charAt(0) : user.username ? user.username.charAt(0) : '?'}
                </div>
                <div className="text-center sm:text-right">
                  <h3 className={`text-lg sm:text-xl font-bold ${user.isactive ? 'text-gray-900' : 'text-gray-600'}`}>{user.username}</h3>
                  <p className="text-sm text-gray-500">{user.full_name || 'بدون نام کامل'}</p>
                  <div className="flex gap-2 mt-2 justify-center sm:justify-start flex-wrap">
                    {user.user_roles && user.user_roles.map(ur => (
                      <span 
                        key={ur.id || `role-${Math.random()}`} 
                        className={`px-2 sm:px-3 py-1 text-xs font-medium rounded-full ${getRoleColor(ur.roles?.name)}`}
                      >
                        {ur.roles?.name === 'admin' ? 'مدیر' : 'مشتری'}
                      </span>
                    ))}
                    <span className={`px-2 sm:px-3 py-1 text-xs font-medium rounded-full ${user.isactive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {user.isactive ? 'فعال' : 'غیرفعال'}
                    </span>
                  </div>
                </div>
              </div>
              
              {/* اطلاعات تماس و حساب - باکس‌ها کوچکتر در موبایل */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-6">
                <div className="bg-gray-50 p-3 sm:p-4 rounded-lg">
                  <h4 className="font-medium text-gray-700 mb-2 sm:mb-3 text-sm sm:text-base">اطلاعات تماس</h4>
                  <div className="space-y-2 sm:space-y-3">
                    <div>
                      <label className="block text-xs text-gray-500">ایمیل</label>
                      <div className="flex items-center mt-1">
                        <Mail className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400 ml-1 sm:ml-2" />
                        <p className="text-xs sm:text-sm truncate">{user.email || 'ثبت نشده'}</p>
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-xs text-gray-500">شماره تلفن</label>
                      <div className="flex items-center mt-1">
                        <Phone className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400 ml-1 sm:ml-2" />
                        <p className="text-xs sm:text-sm">{user.phone_number || 'ثبت نشده'}</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-50 p-3 sm:p-4 rounded-lg">
                  <h4 className="font-medium text-gray-700 mb-2 sm:mb-3 text-sm sm:text-base">اطلاعات حساب</h4>
                  <div className="space-y-2 sm:space-y-3">
                    <div>
                      <label className="block text-xs text-gray-500">شناسه کاربر</label>
                      <p className="text-xs sm:text-sm mt-1">{user.id}</p>
                    </div>
                    
                    <div>
                      <label className="block text-xs text-gray-500">تاریخ عضویت</label>
                      <div className="flex items-center mt-1">
                        <Calendar className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400 ml-1 sm:ml-2" />
                        <p className="text-xs sm:text-sm">{formatDate(user.created_at)}</p>
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-xs text-gray-500">آخرین ورود</label>
                      <div className="flex items-center mt-1">
                        <Calendar className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400 ml-1 sm:ml-2" />
                        <p className="text-xs sm:text-sm">{getLastLoginDate(user)}</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                {user.description && (
                  <div className="bg-gray-50 p-3 sm:p-4 rounded-lg sm:col-span-2">
                    <h4 className="font-medium text-gray-700 mb-2 text-sm sm:text-base">توضیحات</h4>
                    <p className="text-xs sm:text-sm text-gray-600">{user.description}</p>
                  </div>
                )}
              </div>
            </div>
          )}
          
          {/* تب سفارشات - ساده‌تر در موبایل */}
          {activeTab === 'orders' && (
            <div>
              {user._count?.orders > 0 ? (
                <div className="bg-blue-50 p-3 sm:p-4 rounded-lg text-center">
                  <p className="text-blue-700 text-sm">{user._count.orders} سفارش</p>
                  <p className="text-xs text-blue-600 mt-1 sm:mt-2">برای مشاهده جزئیات، به بخش مدیریت سفارش‌ها مراجعه کنید.</p>
                </div>
              ) : (
                <div className="bg-gray-50 p-3 sm:p-4 rounded-lg text-center">
                  <p className="text-gray-500 text-sm">این کاربر هنوز سفارشی ثبت نکرده است.</p>
                </div>
              )}
            </div>
          )}
          
          {/* تب کامنت‌ها - کوچکتر در موبایل */}
          {activeTab === 'comments' && (
            <div className="space-y-3 sm:space-y-4">
              {user.comments && user.comments.length > 0 ? (
                user.comments.map((comment) => (
                  <div 
                    key={comment.id || `comment-${Math.random()}`} 
                    className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden"
                  >
                    <div className="flex justify-between items-center bg-gray-50 px-2 sm:px-4 py-1.5 sm:py-2 border-b border-gray-200">
                      <div className="flex items-center">
                        <div className="w-6 h-6 sm:w-8 sm:h-8 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-xs font-bold">
                          {comment.product_id ? comment.product_id.toString().charAt(0).toUpperCase() : 'P'}
                        </div>
                        <div className="mr-2 sm:mr-3">
                          <div className="font-medium text-xs sm:text-sm truncate max-w-[150px] sm:max-w-none">
                            {products[comment.product_id]?.name || 
                            comment.product?.name || 
                            comment.product_name || 
                            `محصول #${comment.product_id}`}
                          </div>
                          <div className="text-[10px] sm:text-xs text-gray-500">کد: {comment.product_id || 'نامشخص'}</div>
                        </div>
                      </div>
                      <div className="text-[10px] sm:text-xs text-gray-500 bg-white px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full shadow-sm">
                        {formatDate(comment.created_at || comment.date) || 'تاریخ نامشخص'}
                      </div>
                    </div>
                    
                    <div className="p-2 sm:p-4">
                      <div className="flex items-center mb-1 sm:mb-2">
                        <div className="flex ml-1 sm:ml-2">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <svg
                              key={star}
                              className={`w-3 h-3 sm:w-4 sm:h-4 ${
                                star <= (comment.rating || comment.stars || 0) ? 'text-yellow-400' : 'text-gray-300'
                              }`}
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                          ))}
                        </div>
                        <span className="text-[10px] sm:text-xs text-gray-500">
                          {comment.rating || comment.stars || 0} از 5
                        </span>
                      </div>
                      
                      <div className="text-xs sm:text-sm text-gray-700 border-r-2 border-gray-200 pr-2 max-h-16 sm:max-h-none overflow-y-auto">
                        {comment.text || 'بدون متن'}
                      </div>
                      <div className="mt-2 sm:mt-3 flex justify-end space-x-2">
                        <button 
                          className="text-[10px] sm:text-xs text-blue-600 hover:text-blue-800 transition-colors"
                          onClick={() => {
                            const productId = comment.product_id;
                            if (productId) {
                              window.open(`/productView?id=${productId}`, '_blank');
                            }
                          }}
                        >
                          مشاهده محصول
                        </button>
                        <button
                          onClick={() => deleteComment(comment.id)}
                          disabled={deletingComment === comment.id}
                          className="text-[10px] sm:text-xs text-red-600 hover:text-red-800 transition-colors"
                        >
                          {deletingComment === comment.id ? 'در حال حذف...' : 'حذف'}
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="bg-gray-50 p-3 sm:p-4 rounded-lg text-center">
                  <p className="text-gray-500 text-xs sm:text-sm">این کاربر هنوز نظری ثبت نکرده است.</p>
                </div>
              )}
            </div>
          )}
        </div>
        
        {/* دکمه‌های عملیات - کوچکتر و فشرده‌تر در موبایل */}
        <div className="p-3 sm:p-4 border-t border-gray-200 bg-gray-50 flex justify-end space-x-2 sm:space-x-3 space-x-reverse">
          <button
            onClick={onClose}
            className="px-3 py-1.5 sm:px-4 sm:py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors text-xs sm:text-sm"
          >
            بستن
          </button>
          
          <button
            onClick={() => {
              onClose();
              toggleUserStatus(user.id);
            }}
            className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg text-xs sm:text-sm ${
              user.isactive 
                ? 'bg-amber-500 text-white hover:bg-amber-600' 
                : 'bg-green-500 text-white hover:bg-green-600'
            } transition-colors`}
          >
            {user.isactive ? 'غیرفعال‌سازی' : 'فعال‌سازی'}
          </button>
        </div>
      </div>
    </div>
  );
};

  return (
    <div className="min-h-screen bg-gray-50 p-3 sm:p-6" dir="rtl">
      <div className="max-w-7xl mx-auto">
        {/* Header - ریسپانسیو برای دسکتاپ و موبایل */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6 mb-4 sm:mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-0">مدیریت کاربران</h1>
            <button
              onClick={fetchUsers}
              disabled={loading}
              className="flex items-center justify-center space-x-2 space-x-reverse px-3 sm:px-4 py-1 sm:py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 text-sm"
            >
              <RefreshCw className={`w-3 h-3 sm:w-4 sm:h-4 ${loading ? 'animate-spin' : ''}`} />
              <span>بروزرسانی</span>
            </button>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4 sm:mb-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-5 h-5 text-red-400">⚠️</div>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-800">{error}</p>
              </div>
              <div className="mr-auto">
                <button
                  onClick={fetchUsers}
                  className="bg-red-100 text-red-800 px-3 py-1 rounded text-sm hover:bg-red-200 transition-colors"
                >
                  تلاش مجدد
                </button>
              </div>
            </div>
          </div>
        )}

        {/* دسکتاپ: فیلترها */}
        <div className="hidden md:block bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute right-3 top-3 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="جستجو بر اساس نام کاربری، ایمیل یا نام..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pr-10 pl-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">همه نقش‌ها</option>
              <option value="admin">مدیر</option>
              <option value="customer">مشتری</option>
            </select>
            
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">همه وضعیت‌ها</option>
              <option value="active">فعال</option>
              <option value="inactive">غیرفعال</option>
            </select>
          </div>
        </div>

        {/* دسکتاپ: آمار */}
        <div className="hidden md:grid grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="text-2xl font-bold text-gray-900">{stats.totalUsers}</div>
            <div className="text-sm text-gray-500">کل کاربران</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="text-2xl font-bold text-green-600">{stats.activeUsers}</div>
            <div className="text-sm text-gray-500">کاربران فعال</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="text-2xl font-bold text-red-600">{stats.inactiveUsers}</div>
            <div className="text-sm text-gray-500">کاربران غیرفعال</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="text-2xl font-bold text-blue-600">{stats.adminUsers}</div>
            <div className="text-sm text-gray-500">مدیران</div>
          </div>
        </div>

        {/* موبایل: فیلترها - بازطراحی شده */}
        <div className="md:hidden bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-bold text-gray-800">فیلترها</h2>
          </div>
          
          <div className="grid grid-cols-1 gap-3">
            <div className="relative">
              <Search className="absolute right-3 top-3 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="جستجو بر اساس نام کاربری، ایمیل یا نام..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pr-10 pl-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all"> نقش‌ها</option>
                <option value="admin">مدیر</option>
                <option value="customer">مشتری</option>
              </select>
              
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all"> وضعیت‌ها</option>
                <option value="active">فعال</option>
                <option value="inactive">غیرفعال</option>
              </select>
            </div>
          </div>
        </div>

        {/* موبایل: بخش آمار - کوچکتر و زیر فیلترها */}
        <div className="md:hidden grid grid-cols-2 gap-2 mb-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
            <div className="text-lg font-bold text-gray-900">{stats.totalUsers}</div>
            <div className="text-xs text-gray-500">کل کاربران</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
            <div className="text-lg font-bold text-green-600">{stats.activeUsers}</div>
            <div className="text-xs text-gray-500">کاربران فعال</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
            <div className="text-lg font-bold text-red-600">{stats.inactiveUsers}</div>
            <div className="text-xs text-gray-500">کاربران غیرفعال</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
            <div className="text-lg font-bold text-blue-600">{stats.adminUsers}</div>
            <div className="text-xs text-gray-500">مدیران</div>
          </div>
        </div>

        {/* Users Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            <span className="mr-3 text-gray-600">در حال بارگذاری...</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {filteredUsers.map(user => (
              <UserCard key={user.id} user={user} />
            ))}
          </div>
        )}

        {filteredUsers.length === 0 && !loading && (
          <div className="text-center py-12 text-gray-500">
            <User className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>کاربری یافت نشد</p>
          </div>
        )}

        {/* User Details Modal */}
        {showModal && selectedUser && (
          <UserModal user={selectedUser} onClose={() => setShowModal(false)} />
        )}
      </div>
    </div>
  );
};

export default UserManagementAdmin;