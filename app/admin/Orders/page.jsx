"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Package, Truck, CheckCircle, Clock, MapPin, Calendar, Eye, Filter, Search,
  XCircle, AlertCircle, RefreshCw, User, Phone, Mail, Edit3, X
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const getStatusColor = (status) => {
  switch (status) {
    case 'delivered': return 'bg-green-100 text-green-800 border-green-200';
    case 'shipped': return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'processing':
    case 'paid': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'pending': return 'bg-orange-100 text-orange-800 border-orange-200';
    case 'cancelled':
    case 'failed': return 'bg-red-100 text-red-800 border-red-200';
    case 'refunded': return 'bg-purple-100 text-purple-800 border-purple-200';
    default: return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

const getStatusIcon = (status) => {
  switch (status) {
    case 'delivered': return <CheckCircle size={16} />;
    case 'shipped': return <Truck size={16} />;
    case 'processing':
    case 'paid': return <Clock size={16} />;
    case 'pending': return <AlertCircle size={16} />;
    case 'cancelled':
    case 'failed': return <XCircle size={16} />;
    case 'refunded': return <RefreshCw size={16} />;
    default: return <Package size={16} />;
  }
};

export default function AdminOrdersPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [unauthorized, setUnauthorized] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [editingStatus, setEditingStatus] = useState(null);
  const [newStatus, setNewStatus] = useState('');

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (!mounted || authLoading) return;

    // If no user at all, go login
    if (!user) {
      router.push('/login');
      return;
    }

    // If user exists but not admin, show in-page unauthorized, do NOT redirect
    if (typeof user.roles === 'string' && user.roles !== 'admin') {
      setUnauthorized(true);
      setLoading(false);
      return;
    }

    // Admin: fetch data
    fetchAllOrders();
  }, [mounted, authLoading, user, router]);

  const fetchAllOrders = async () => {
    try {
      setLoading(true);
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

      const res = await fetch('/api/admin/orders', {
        headers: { Authorization: `Bearer ${token || ''}` }
      });

      if (res.status === 403) {
        setUnauthorized(true);
        setOrders([]);
        return;
      }

      const data = await res.json();
      if (data?.success) {
        setOrders(data.orders || []);
      } else {
        toast.error(data?.error || 'خطا در دریافت سفارشات');
      }
    } catch (e) {
      toast.error('خطا در دریافت سفارشات');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (orderId, status) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/admin/orders/update-status', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ orderId, status })
      });

      if (res.status === 403) {
        setUnauthorized(true);
        toast.error('دسترسی مجاز نیست');
        return;
      }

      const result = await res.json();
      if (result.success) {
        toast.success('وضعیت سفارش بروزرسانی شد');
        setEditingStatus(null);
        fetchAllOrders();
      } else {
        toast.error(result.error || 'خطا در تغییر وضعیت');
      }
    } catch (e) {
      toast.error('خطا در تغییر وضعیت');
    }
  };

  const getStatusText = (status) => ({
    pending: 'در انتظار پرداخت',
    paid: 'پرداخت شده',
    processing: 'در حال پردازش',
    shipped: 'در حال ارسال',
    delivered: 'تحویل داده شده',
    cancelled: 'لغو شده',
    refunded: 'مرجوع شده'
  }[status] || 'نامشخص');

  const toggleOrderDetails = (orderId) => {
    setExpandedOrder(expandedOrder === orderId ? null : orderId);
  };

  const filteredOrders = orders.filter(order => {
    const matchesStatus = selectedStatus === 'all' || order.status === selectedStatus;
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      order.id.toLowerCase().includes(q) ||
      order.user?.full_name?.toLowerCase().includes(q) ||
      order.user?.email?.toLowerCase().includes(q) ||
      order.items?.some(item => item.name.toLowerCase().includes(q)) ||
      order.delivery_address?.toLowerCase().includes(q);
    return matchesStatus && matchesSearch;
  });

  // Loading states
  if (!mounted || authLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-blue-600 text-xl font-medium bg-white/80 backdrop-blur-sm px-6 py-2 rounded-xl shadow-lg">در حال بارگذاری...</p>
        </div>
      </div>
    );
  }

  if (unauthorized) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-xl border border-white/20 max-w-md">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <XCircle size={48} className="text-red-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">دسترسی مجاز نیست</h2>
          <p className="text-gray-600">شما مجوز دسترسی به این صفحه را ندارید.</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <ToastContainer />
      <div dir="rtl" className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <div className="w-full px-4 py-6 space-y-6">
          {/* Hero Header */}
          <div className="text-center space-y-4">
            <div className="inline-flex items-center justify-center w-12 h-12 md:w-14 md:h-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-lg mb-4">
              <Package className="w-6 h-6 md:w-8 md:h-8 text-white" />
            </div>
            <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
              مدیریت سفارشات
            </h1>
            <p className="text-slate-500 max-w-2xl mx-auto">
              در این بخش می‌توانید تمامی سفارشات را مشاهده، بررسی و وضعیت آنها را مدیریت کنید.
            </p>
          </div>

          {/* Filters */}
          <div className="bg-white/70 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 p-6 md:p-8 relative z-10">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center">
                <Filter className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-xl font-bold text-slate-800">فیلترهای سفارشات</h2>
              <div className="text-sm text-gray-500 mr-auto">کل سفارشات: {orders.length}</div>
            </div>
            
            <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="جستجو براساس نام کاربر، ایمیل، محصول یا کد سفارش..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pr-12 pl-4 py-4 bg-white/80 backdrop-blur-sm border-2 border-slate-200 rounded-2xl 
                           focus:border-blue-400 focus:ring-4 focus:ring-blue-100 focus:outline-none
                           transition-all duration-300 group-hover:border-slate-300"
                />
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm font-medium text-gray-700 flex items-center">
                  <Filter size={16} className="ml-1" />
                  فیلتر وضعیت:
                </span>
                {[
                  { key: 'all', label: 'همه', count: orders.length },
                  { key: 'pending', label: 'در انتظار', count: orders.filter(o => o.status === 'pending').length },
                  { key: 'paid', label: 'پرداخت شده', count: orders.filter(o => o.status === 'paid').length },
                  { key: 'processing', label: 'پردازش', count: orders.filter(o => o.status === 'processing').length },
                  { key: 'shipped', label: 'ارسال', count: orders.filter(o => o.status === 'shipped').length },
                  { key: 'delivered', label: 'تحویل', count: orders.filter(o => o.status === 'delivered').length },
                  { key: 'cancelled', label: 'لغو', count: orders.filter(o => o.status === 'cancelled').length }
                ].map(s => (
                  <button
                    key={s.key}
                    onClick={() => setSelectedStatus(s.key)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                      selectedStatus === s.key 
                      ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-md' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {s.label} ({s.count})
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Orders List */}
          <div className="space-y-4">
            {filteredOrders.length > 0 ? (
              filteredOrders.map((order) => (
                <motion.div 
                  key={order.id} 
                  initial={{ opacity: 0, y: 20 }} 
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-xl shadow-sm border overflow-hidden hover:shadow-md transition-all duration-300"
                >
                  <div className="p-6">
                    <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
                      <div className="flex flex-col lg:flex-row lg:items-center gap-4 flex-1">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-bold text-gray-800">{order.id}</h3>
                            <div className={`px-3 py-1 rounded-lg border text-sm font-medium flex items-center gap-2 ${getStatusColor(order.status)}`}>
                              {getStatusIcon(order.status)}
                              {getStatusText(order.status)}
                            </div>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                            <div className="flex items-center text-gray-600"><Calendar size={14} className="ml-1 text-blue-500" />{order.date}</div>
                            <div className="flex items-center text-gray-600"><User size={14} className="ml-1 text-blue-500" />{order.user?.full_name}</div>
                            <div className="flex items-center text-gray-600"><Mail size={14} className="ml-1 text-blue-500" />{order.user?.email}</div>
                          </div>
                        </div>

                        <div className="bg-gradient-to-br from-slate-50 to-blue-50 rounded-xl p-4 min-w-[300px] border border-blue-100">
                          <h4 className="font-medium text-gray-800 mb-2 flex items-center gap-2">
                            <User size={16} className="text-blue-500" />
                            اطلاعات مشتری
                          </h4>
                          <div className="space-y-1 text-sm">
                            <div className="flex items-center"><User size={14} className="ml-2 text-gray-400" /><span>{order.user?.full_name}</span></div>
                            <div className="flex items-center"><Phone size={14} className="ml-2 text-gray-400" /><span>{order.user?.phone_number || 'ندارد'}</span></div>
                            <div className="flex items-center"><MapPin size={14} className="ml-2 text-gray-400" /><span className="text-xs">{order.delivery_address}</span></div>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col items-start xl:items-end gap-3">
                        <div className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-500 bg-clip-text text-transparent">
                          {order.total?.toLocaleString()} تومان
                        </div>
                        <div className="flex gap-2 flex-wrap">
                          {editingStatus === order.id ? (
                            <div className="flex items-center gap-2">
                              <select
                                value={newStatus}
                                onChange={(e) => setNewStatus(e.target.value)}
                                className="px-3 py-1 border border-gray-300 rounded text-sm"
                              >
                                <option value="">انتخاب وضعیت</option>
                                <option value="pending">در انتظار پرداخت</option>
                                <option value="paid">پرداخت شده</option>
                                <option value="processing">در حال پردازش</option>
                                <option value="shipped">در حال ارسال</option>
                                <option value="delivered">تحویل داده شده</option>
                                <option value="cancelled">لغو شده</option>
                                <option value="refunded">مرجوع شده</option>
                              </select>
                              <span
                                onClick={() => handleStatusChange(order.orderId, newStatus)}
                                className={`p-2 rounded-lg ${
                                  !newStatus 
                                  ? 'bg-slate-100 text-slate-400 cursor-not-allowed' 
                                  : 'bg-gradient-to-r from-green-500 to-emerald-500 text-white cursor-pointer hover:shadow-lg'
                                } transition-all duration-300`}
                                title="ثبت تغییر وضعیت"
                              >
                                <CheckCircle size={20} />
                              </span>
                              <button
                                onClick={() => { setEditingStatus(null); setNewStatus(''); }}
                                className="p-2 bg-slate-100 text-slate-500 rounded-lg hover:bg-slate-200 transition-all duration-300"
                              >
                                <X size={20} />
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => { setEditingStatus(order.id); setNewStatus(order.status); }}
                              className="px-3 py-1 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-lg hover:shadow-lg transition-all duration-300 flex items-center gap-2 text-sm"
                            >
                              <Edit3 size={14} /> تغییر وضعیت
                            </button>
                          )}

                          <button 
                            onClick={() => toggleOrderDetails(order.id)} 
                            className={`px-3 py-1 rounded-lg transition-all duration-300 flex items-center gap-2 text-sm ${
                              expandedOrder === order.id
                              ? 'bg-slate-700 text-white'
                              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                            }`}
                          >
                            <Eye size={14} /> {expandedOrder === order.id ? 'بستن' : 'جزئیات'}
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2">
                      {order.items?.slice(0, 3).map((item, i) => (
                        <div key={i} className="flex items-center gap-2 bg-slate-50 rounded-lg p-2 border border-slate-100">
                          <img src={item.image} alt={item.name} className="w-8 h-8 rounded-lg object-cover" />
                          <span className="text-sm text-gray-700">{item.name}</span>
                          <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded-full">{item.quantity}×</span>
                        </div>
                      ))}
                      {order.items?.length > 3 && (
                        <div className="flex items-center justify-center bg-slate-50 rounded-lg p-2 text-sm text-gray-600 border border-slate-100">
                          +{order.items.length - 3} محصول دیگر
                        </div>
                      )}
                    </div>
                  </div>

                  <AnimatePresence>
                    {expandedOrder === order.id && (
                      <motion.div 
                        initial={{ height: 0, opacity: 0 }} 
                        animate={{ height: "auto", opacity: 1 }} 
                        exit={{ height: 0, opacity: 0 }} 
                        className="border-t bg-gradient-to-br from-slate-50 to-blue-50"
                      >
                        <div className="p-6">
                          <div className="grid lg:grid-cols-2 gap-6">
                            <div>
                              <h4 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                                <Package size={18} className="text-blue-500" />
                                جزئیات محصولات
                              </h4>
                              <div className="space-y-3 max-h-60 overflow-y-auto">
                                {order.items?.map((item, i) => (
                                  <div key={i} className="flex items-center gap-3 bg-white rounded-lg p-3 border border-slate-100">
                                    <img src={item.image} alt={item.name} className="w-12 h-12 rounded-lg object-cover" />
                                    <div className="flex-1">
                                      <h5 className="font-medium text-gray-800">{item.name}</h5>
                                      <div className="flex items-center justify-between mt-1">
                                        <span className="text-sm text-gray-500">تعداد: {item.quantity}</span>
                                        <span className="font-bold text-blue-600">{item.price?.toLocaleString()} تومان</span>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>

                            <div>
                              <h4 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                                <Package size={18} className="text-blue-500" />
                                خلاصه سفارش
                              </h4>
                              <div className="bg-white rounded-lg p-4 space-y-3 border border-slate-100">
                                <div className="flex justify-between"><span className="text-gray-600">جمع محصولات:</span><span>{order.items?.reduce((s, it) => s + (it.price * it.quantity), 0).toLocaleString()} تومان</span></div>
                                <div className="flex justify-between"><span className="text-gray-600">هزینه ارسال:</span><span className="text-green-600">رایگان</span></div>
                                <div className="flex justify-between pt-2 border-t border-slate-100">
                                  <span className="font-bold text-gray-800">مجموع کل:</span>
                                  <span className="font-bold text-lg bg-gradient-to-r from-blue-600 to-indigo-500 bg-clip-text text-transparent">{order.total?.toLocaleString()} تومان</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))
            ) : (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center bg-white rounded-xl shadow-sm border p-12 text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-slate-100 to-slate-200 rounded-2xl 
                              flex items-center justify-center mx-auto mb-4">
                  <Package className="w-10 h-10 text-slate-400" />
                </div>
                <h3 className="text-xl font-bold text-gray-700 mb-3">سفارشی یافت نشد</h3>
                <p className="text-gray-500">{orders.length === 0 ? 'هیچ سفارشی در سیستم وجود ندارد.' : 'هیچ سفارشی مطابق با فیلترهای انتخابی یافت نشد.'}</p>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}