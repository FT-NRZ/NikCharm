"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Package, 
  Truck, 
  CheckCircle, 
  Clock, 
  MapPin, 
  Calendar,
  Eye,
  Download,
  Filter,
  Search,
  CreditCard,
  XCircle,
  AlertCircle,
  RefreshCw
} from 'lucide-react';
import Header from '../components/Header';
import { useAuth } from '../contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import InvoiceModal from '../components/InvoiceModal';


const getStatusColor = (status) => {
  switch (status) {
    case 'delivered':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'shipped':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'cancelled':
      return 'bg-red-100 text-red-800 border-red-200';
    case 'processing':
    case 'paid':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'pending':
      return 'bg-orange-100 text-orange-800 border-orange-200';
    case 'cancelled':
    case 'failed':
      return 'bg-red-100 text-red-800 border-red-200';
    case 'refunded':
      return 'bg-purple-100 text-purple-800 border-purple-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

const getStatusIcon = (status) => {
  switch (status) {
    case 'delivered':
      return <CheckCircle size={16} />;
    case 'shipped':
      return <Truck size={16} />;
    case 'processing':
    case 'paid':
      return <Clock size={16} />;
    case 'pending':
      return <AlertCircle size={16} />;
    case 'cancelled':
    case 'failed':
      return <XCircle size={16} />;
    case 'refunded':
      return <RefreshCw size={16} />;
    default:
      return <Package size={16} />;
  }
};

export default function OrdersPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  const handleShowInvoice = (order) => {
    setSelectedInvoice(order);
    setShowInvoiceModal(true);
  };

  const handleCloseInvoice = () => {
    setShowInvoiceModal(false);
    setSelectedInvoice(null);
  };

  useEffect(() => {
    // صبر تا auth loading تمام شود
    if (authLoading) {
      console.log('در حال بررسی authentication...');
      return;
    }

    // اگر user وجود نداشت، انتقال به login
    if (!user) {
      console.log('کاربر وارد نشده - انتقال به صفحه ورود');
      router.push('/login');
      return;
    }

    // اگر همه چیز OK بود، fetch کن
    console.log('کاربر تأیید شد، دریافت سفارشات...');
    fetchOrders();
  }, [user, authLoading, router]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        console.log('Token یافت نشد در fetchOrders');
        router.push('/login');
        return;
      }

      console.log('درخواست API سفارشات...');
      
      const response = await fetch('/api/orders', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      console.log('پاسخ API:', response.status);

      if (response.status === 401) {
        console.log('Token منقضی شده');
        localStorage.removeItem('token');
        router.push('/login');
        return;
      }

      const data = await response.json();

      if (data.success) {
        console.log('سفارشات دریافت شد:', data.orders.length);
        setOrders(data.orders);
      } else {
        console.error('خطا در دریافت سفارشات:', data.error);
      }
    } catch (error) {
      console.error('خطا در fetchOrders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async (orderId, amount) => {
    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch('/api/payments/process', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          orderId: orderId,
          gatewayId: 1,
          amount: amount
        })
      });

      const result = await response.json();

      if (result.success) {
        window.location.href = result.payment_url;
      } else {
        alert('خطا در پردازش پرداخت: ' + result.error);
      }
    } catch (error) {
      console.error('خطا در پرداخت:', error);
      alert('خطا در ارتباط با سرور');
    }
  };

  const handleCancelOrder = async (order) => {
    toast.info('در حال لغو سفارش...', {
      position: "top-right",
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      theme: "colored",
    });

    try {
      const token = localStorage.getItem('token');
      
      // ارسال orderId واقعی (عددی) نه شماره نمایشی
      const response = await fetch(`/api/orders/cancel`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ orderId: order.orderId }) // استفاده از orderId نه id
      });

      const result = await response.json();

      if (response.ok && result.success) {
        toast.success('سفارش با موفقیت لغو شد!', {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          theme: "colored",
        });

        // به‌روزرسانی لیست سفارشات
        fetchOrders();
      } else {
        throw new Error(result.error || result.details || 'خطای نامشخص');
      }
    } catch (error) {
      console.error('❌ خطا در لغو سفارش:', error);
      toast.error(`خطا در لغو سفارش: ${error.message}`, {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: "colored",
      });
    }
  };
  const handleChangeStatus = async (order, newStatus) => {
  try {
    const token = localStorage.getItem('token');
    
    const response = await fetch(`/api/orders/change-status`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ 
        orderId: order.orderId, 
        status: newStatus 
      })
    });

    const result = await response.json();

    if (response.ok && result.success) {
      toast.success(`وضعیت سفارش به "${newStatus}" تغییر کرد!`, {
        position: "top-right",
        autoClose: 3000,
        theme: "colored",
      });

      fetchOrders();
    } else {
      throw new Error(result.error || 'خطای نامشخص');
    }
  } catch (error) {
    toast.error(`خطا در تغییر وضعیت: ${error.message}`, {
      position: "top-right",
      autoClose: 3000,
      theme: "colored",
    });
  }
};

  const handleRestoreOrder = async (order) => {
    toast.info('در حال بازگردانی سفارش...', {
      position: "top-right",
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      theme: "colored",
    });

    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch(`/api/orders/restore`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ orderId: order.orderId })
      });

      const result = await response.json();

      if (response.ok && result.success) {
        toast.success('سفارش با موفقیت بازگردانی شد!', {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          theme: "colored",
        });

        // به‌روزرسانی لیست سفارشات
        fetchOrders();
      } else {
        throw new Error(result.error || result.details || 'خطای نامشخص');
      }
    } catch (error) {
      console.error('❌ خطا در بازگردانی سفارش:', error);
      toast.error(`خطا در بازگردانی سفارش: ${error.message}`, {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: "colored",
      });
    }
  };


  const toggleOrderDetails = (orderId) => {
    setExpandedOrder(expandedOrder === orderId ? null : orderId);
  };

  // فیلتر کردن سفارشات
  const filteredOrders = orders.filter(order => {
    const matchesStatus = selectedStatus === 'all' || order.status === selectedStatus;
    const matchesSearch = order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         order.items?.some(item => item.name.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesStatus && matchesSearch;
  });

  // اگر auth loading است
  if (authLoading) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block w-12 h-12 border-4 border-[#0F2C59] border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-[#0F2C59] text-xl font-medium">در حال بررسی هویت...</p>
          </div>
        </div>
      </>
    );
  }

  // اگر user وجود نداشت
  if (!user) {
    return null;
  }

  // اگر در حال loading سفارشات است
  if (loading) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block w-12 h-12 border-4 border-[#0F2C59] border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-[#0F2C59] text-xl font-medium">در حال بارگذاری سفارشات...</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Header />
      <ToastContainer />
      <div className="flex flex-col min-h-screen bg-white">
        {/* Hero Section */}
        <section className="relative py-24 bg-[#0F2C59] overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute -rotate-45 top-0 right-1/4 w-96 h-96 border-t-8 border-r-8 border-white rounded-full"></div>
            <div className="absolute -rotate-12 bottom-0 left-1/3 w-80 h-80 border-b-8 border-l-8 border-white rounded-full"></div>
            <div className="absolute top-1/2 left-1/4 w-64 h-64 border-4 border-white rounded-full"></div>
            <div className="absolute bottom-1/4 right-1/4 w-40 h-40 border-2 border-white rounded-full"></div>
          </div>
          
          <div className="relative container mx-auto px-6 text-center">
            <h1 className="text-white text-5xl md:text-6xl font-bold mb-6">سفارشات من</h1>
            <p className="text-white/90 text-xl md:text-2xl mb-8 max-w-3xl mx-auto">
              مشاهده و پیگیری سفارشات ثبت شده
            </p>
            <div className="w-20 h-1 bg-white/80 mx-auto rounded-full"></div>
          </div>
        </section>

        {/* Main Content */}
        <main dir="rtl" className="flex-1 container mx-auto p-4 md:p-6 lg:p-8 pb-16">
          {/* Filters and Search */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
            {/* Desktop Layout - همانطور که هست */}
            <div className="hidden md:flex md:flex-row gap-4 items-start md:items-center justify-between">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="جستجو در سفارشات..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pr-10 pl-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#0F2C59] focus:border-transparent"
                />
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm font-medium text-gray-700 flex items-center">
                  <Filter size={16} className="ml-1" />
                  فیلتر وضعیت:
                </span>
                {[
                  { key: 'all', label: 'همه', count: orders.length },
                  { key: 'pending', label: 'در انتظار پرداخت', count: orders.filter(o => o.status === 'pending').length },
                  { key: 'paid', label: 'پرداخت شده', count: orders.filter(o => o.status === 'paid').length },
                  { key: 'processing', label: 'در حال پردازش', count: orders.filter(o => o.status === 'processing').length },
                  { key: 'shipped', label: 'در حال ارسال', count: orders.filter(o => o.status === 'shipped').length },
                  { key: 'delivered', label: 'تحویل شده', count: orders.filter(o => o.status === 'delivered').length },
                  { key: 'cancelled', label: 'لغو شده', count: orders.filter(o => o.status === 'cancelled').length }
                ].map((status) => (
                  <button
                    key={status.key}
                    onClick={() => setSelectedStatus(status.key)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                      selectedStatus === status.key
                        ? 'bg-[#0F2C59] text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {status.label} ({status.count})
                  </button>
                ))}
              </div>
            </div>

            {/* Mobile Layout - جدید */}
            <div className="md:hidden">
              {/* Search Box */}
              <div className="mb-4">
                <div className="relative">
                  <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="text"
                    placeholder="جستجو در سفارشات..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pr-10 pl-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#0F2C59] focus:border-transparent"
                  />
                </div>
              </div>
              
              {/* Filters Title */}
              <div className="flex items-center gap-2 mb-3">
                <Filter size={16} className="text-gray-700 flex-shrink-0" />
                <span className="text-sm font-medium text-gray-700 flex-shrink-0">فیلتر وضعیت:</span>
              </div>
              
              {/* Horizontal Scroll Filters */}
              <div className="overflow-x-auto scrollbar-hide">
                <div className="flex gap-2 pb-2" style={{ minWidth: 'max-content' }}>
                  {[
                    { key: 'all', label: 'همه', count: orders.length },
                    { key: 'pending', label: 'در انتظار پرداخت', count: orders.filter(o => o.status === 'pending').length },
                    { key: 'paid', label: 'پرداخت شده', count: orders.filter(o => o.status === 'paid').length },
                    { key: 'processing', label: 'در حال پردازش', count: orders.filter(o => o.status === 'processing').length },
                    { key: 'shipped', label: 'در حال ارسال', count: orders.filter(o => o.status === 'shipped').length },
                    { key: 'delivered', label: 'تحویل شده', count: orders.filter(o => o.status === 'delivered').length },
                    { key: 'cancelled', label: 'لغو شده', count: orders.filter(o => o.status === 'cancelled').length }
                  ].map((status) => (
                    <button
                      key={status.key}
                      onClick={() => setSelectedStatus(status.key)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap flex-shrink-0 ${
                        selectedStatus === status.key
                          ? 'bg-[#0F2C59] text-white shadow-md'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {status.label} ({status.count})
                    </button>
                  ))}
                </div>
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
                  className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
                >
                  {/* Order Header */}
                  <div className="p-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex flex-col md:flex-row md:items-center gap-4">
                        <div>
                          <h3 className="text-lg font-bold text-gray-800">{order.id}</h3>
                          <p className="text-sm text-gray-500 flex items-center mt-1">
                            <Calendar size={14} className="ml-1" />
                            تاریخ ثبت: {order.date}
                          </p>
                          {order.transaction_id && (
                            <p className="text-xs text-gray-400 mt-1">
                              کد تراکنش: {order.transaction_id}
                            </p>
                          )}
                        </div>
                        
                        <div className={`px-3 py-2 rounded-lg border text-sm font-medium flex items-center gap-2 w-fit ${getStatusColor(order.status)}`}>
                          {getStatusIcon(order.status)}
                          {order.statusText}
                        </div>
                      </div>

                      <div className="flex flex-col md:items-end gap-2">
                        <p className="text-xl font-bold text-gray-800">
                          {order.total?.toLocaleString()} تومان
                        </p>
                        <div className="flex gap-2 flex-wrap">
                          {/* دکمه پرداخت برای سفارشات در انتظار */}
                          {order.status === 'pending' && (
                            <button
                              onClick={() => handlePayment(order.orderId, order.total)}
                              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 text-sm"
                            >
                              <CreditCard size={16} />
                              پرداخت
                            </button>
                          )}

                          {/* دکمه مشاهده جزئیات */}
                          <button
                            onClick={() => toggleOrderDetails(order.id)}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 text-sm"
                          >
                            <Eye size={16} />
                            {expandedOrder === order.id ? 'بستن جزئیات' : 'مشاهده جزئیات'}
                          </button>
                          {/* دکمه نمایش فاکتور */}
                          {(order.status === 'paid' || order.status === 'processing' || order.status === 'shipped' || order.status === 'delivered') && (
                            <button 
                              onClick={() => handleShowInvoice(order)}
                              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2 text-sm"
                            >
                              <Download size={16} />
                              مشاهده فاکتور
                            </button>
                          )}
                          {/* دکمه لغو سفارش یا بازگردانی */}
                          {order.status === 'cancelled' ? (
                            <button
                              onClick={() => handleRestoreOrder(order)}
                              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 text-sm"
                            >
                              <RefreshCw size={16} />
                              بازگردانی سفارش
                            </button>
                          ) : order.status !== 'delivered' && (
                            <button
                              onClick={() => handleCancelOrder(order)}
                              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2 text-sm"
                            >
                              <XCircle size={16} />
                              لغو سفارش
                            </button>
                          )}

                          {/* دکمه‌های تست برای تغییر وضعیت */}
                          <div className="flex gap-1">
                            <button
                              onClick={() => handleChangeStatus(order, 'paid')}
                              className="px-2 py-1 bg-yellow-500 text-white rounded text-xs hover:bg-yellow-600"
                              title="تست: تغییر به پرداخت شده"
                            >
                              💳
                            </button>
                            <button
                              onClick={() => handleChangeStatus(order, 'shipped')}
                              className="px-2 py-1 bg-blue-500 text-white rounded text-xs hover:bg-blue-600"
                              title="تست: تغییر به در حال ارسال"
                            >
                              🚚
                            </button>
                            <button
                              onClick={() => handleChangeStatus(order, 'delivered')}
                              className="px-2 py-1 bg-green-500 text-white rounded text-xs hover:bg-green-600"
                              title="تست: تغییر به تحویل شده"
                            >
                              ✅
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Order Items Preview */}
                    <div className="mt-4 flex flex-wrap gap-2">
                      {order.items?.slice(0, 3).map((item, index) => (
                        <div key={index} className="flex items-center gap-2 bg-gray-50 rounded-lg p-2">
                          <img 
                            src={item.image} 
                            alt={item.name}
                            className="w-10 h-10 rounded-lg object-cover"
                          />
                          <span className="text-sm text-gray-700">{item.name}</span>
                          {item.quantity > 1 && (
                            <span className="text-xs bg-[#0F2C59]/10 text-[#0F2C59] px-2 py-1 rounded-full">
                              {item.quantity}×
                            </span>
                          )}
                        </div>
                      ))}
                      {order.items?.length > 3 && (
                        <div className="flex items-center justify-center bg-gray-100 rounded-lg p-2 text-sm text-gray-600">
                          +{order.items.length - 3} محصول دیگر
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Expanded Order Details */}
                  {expandedOrder === order.id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="border-t border-gray-100 bg-gray-50"
                    >
                      <div className="p-6">
                        <div className="grid md:grid-cols-2 gap-6">
                          {/* Order Items Detail */}
                          <div>
                            <h4 className="font-bold text-gray-800 mb-4">جزئیات محصولات</h4>
                            <div className="space-y-3">
                              {order.items?.map((item, index) => (
                                <div key={index} className="flex items-center gap-3 bg-white rounded-lg p-3">
                                  <img 
                                    src={item.image} 
                                    alt={item.name}
                                    className="w-16 h-16 rounded-lg object-cover"
                                  />
                                  <div className="flex-1">
                                    <h5 className="font-medium text-gray-800">{item.name}</h5>
                                    {item.product?.material && (
                                      <p className="text-xs text-gray-500">جنس: {item.product.material}</p>
                                    )}
                                    {item.product?.color && (
                                      <p className="text-xs text-gray-500">رنگ: {item.product.color}</p>
                                    )}
                                    <div className="flex items-center justify-between mt-1">
                                      <span className="text-sm text-gray-500">تعداد: {item.quantity}</span>
                                      <span className="font-bold text-[#0F2C59]">
                                        {item.price?.toLocaleString()} تومان
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Shipping & Payment Info */}
                          <div>
                            <h4 className="font-bold text-gray-800 mb-4">اطلاعات ارسال و پرداخت</h4>
                            <div className="bg-white rounded-lg p-4 space-y-4">
                              <div className="flex items-start gap-3">
                                <MapPin className="text-[#0F2C59] mt-1" size={16} />
                                <div>
                                  <p className="text-sm font-medium text-gray-700">آدرس تحویل:</p>
                                  <p className="text-sm text-gray-600 mt-1">{order.delivery_address}</p>
                                </div>
                              </div>

                              {order.payment_gateway && (
                                <div className="flex items-center gap-3">
                                  <CreditCard className="text-[#0F2C59]" size={16} />
                                  <div>
                                    <p className="text-sm font-medium text-gray-700">درگاه پرداخت:</p>
                                    <p className="text-sm text-gray-600">{order.payment_gateway}</p>
                                  </div>
                                </div>
                              )}

                              {/* Order Summary */}
                              <div className="border-t pt-3 mt-3">
                                <div className="flex justify-between items-center mb-2">
                                  <span className="text-sm text-gray-600">جمع محصولات:</span>
                                  <span className="text-sm font-medium">
                                    {order.items?.reduce((sum, item) => sum + (item.price * item.quantity), 0).toLocaleString()} تومان
                                  </span>
                                </div>
                                <div className="flex justify-between items-center mb-2">
                                  <span className="text-sm text-gray-600">هزینه ارسال:</span>
                                  <span className="text-sm font-medium text-green-600">رایگان</span>
                                </div>
                                <div className="flex justify-between items-center pt-2 border-t">
                                  <span className="font-bold text-gray-800">مجموع کل:</span>
                                  <span className="font-bold text-lg text-[#0F2C59]">
                                    {order.total?.toLocaleString()} تومان
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              ))
            ) : (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center"
              >
                <div className="bg-[#0F2C59]/10 p-6 rounded-full mb-6">
                  <Package size={48} className="text-[#0F2C59]" />
                </div>
                <h3 className="text-xl font-bold text-gray-700 mb-3">سفارشی یافت نشد</h3>
                <p className="text-gray-500 mb-6 max-w-md">
                  {orders.length === 0 
                    ? 'شما هنوز سفارشی ثبت نکرده‌اید.'
                    : 'هیچ سفارشی مطابق با فیلترهای انتخابی شما یافت نشد.'
                  }
                </p>
                {orders.length === 0 ? (
                  <button
                    onClick={() => router.push('/products')}
                    className="bg-[#0F2C59] text-white px-6 py-3 rounded-xl hover:bg-[#0F2C59]/90 transition-colors"
                  >
                    مشاهده محصولات
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      setSelectedStatus('all');
                      setSearchQuery('');
                    }}
                    className="bg-[#0F2C59] text-white px-6 py-3 rounded-xl hover:bg-[#0F2C59]/90 transition-colors"
                  >
                    نمایش همه سفارشات
                  </button>
                )}
              </motion.div>
            )}
          </div>
        </main>
      </div>
      {/* در انتهای return اضافه کن */}
      <InvoiceModal 
        isOpen={showInvoiceModal}
        onClose={handleCloseInvoice}
        order={selectedInvoice}
      />
    </>
  );
}