'use client';
import ProductCard from '../../../app/components/cards/ProductCard';
import { useState, useRef, useEffect } from 'react';
import { HiOutlineSearch, HiOutlineFilter, HiOutlineTag, HiX } from "react-icons/hi";
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../../app/contexts/AuthContext';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [isClient, setIsClient] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const { user, loading } = useAuth();
  const router = useRouter();

    useEffect(() => {
    if (!loading) {
      // اگر کاربر لاگین نیست یا نقش ادمین ندارد
      if (!user || !(user.role === 'admin' || (user.user_roles && user.user_roles.some(r => r.roles?.name === 'admin')))) {
        router.replace('/'); // یا '/login'
      }
    }
  }, [user, loading, router]);

  // تشخیص موبایل
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // گرفتن محصولات و دسته‌بندی‌ها از دیتابیس
  useEffect(() => {
    setIsClient(true);
    
    fetch('/api/products')
      .then(res => res.json())
      .then(data => setProducts(data.products || []));
    fetch('/api/categories')
      .then(res => res.json())
      .then(data => setCategories(data.categories || []));
  }, []);

  // محاسبه کمترین و بیشترین قیمت محصولات
  const prices = products.map(p => Number(p.price)).filter(Boolean);
  const minPrice = prices.length ? Math.min(...prices) : 0;
  const maxPrice = prices.length ? Math.max(...prices) : 1000000;

  // اسلایدر قیمت
  const [sliderPos, setSliderPos] = useState({ start: 0, end: 100 });
  const [priceRange, setPriceRange] = useState({ start: 0, end: 1000000 });
  const sliderRef = useRef(null);
  const isDragging = useRef(null);

  useEffect(() => {
    if (isClient && prices.length > 0) {
      const startPrice = Math.round(minPrice + (sliderPos.start / 100) * (maxPrice - minPrice));
      const endPrice = Math.round(minPrice + (sliderPos.end / 100) * (maxPrice - minPrice));
      setPriceRange({ start: startPrice, end: endPrice });
    }
  }, [sliderPos, minPrice, maxPrice, isClient, prices.length]);

  // مدیریت اسلایدر قیمت
  const handleMove = (clientX) => {
    const slider = sliderRef.current;
    if (!slider) return;
    const rect = slider.getBoundingClientRect();
    const newX = Math.min(Math.max(clientX - rect.left, 0), rect.width);
    const percentage = (newX / rect.width) * 100;

    if (isDragging.current === 'start') {
      const newStart = Math.min(percentage, sliderPos.end - 5);
      setSliderPos(prev => ({ ...prev, start: newStart }));
    } else if (isDragging.current === 'end') {
      const newEnd = Math.max(percentage, sliderPos.start + 5);
      setSliderPos(prev => ({ ...prev, end: newEnd }));
    }
  };

  const mouseMove = (e) => handleMove(e.clientX);
  const touchMove = (e) => handleMove(e.touches[0].clientX);

  const stopDragging = () => {
    isDragging.current = null;
    window.removeEventListener('mousemove', mouseMove);
    window.removeEventListener('touchmove', touchMove);
    window.removeEventListener('mouseup', stopDragging);
    window.removeEventListener('touchend', stopDragging);
  };

  const handleDragStart = (type) => {
    isDragging.current = type;
    window.addEventListener('mousemove', mouseMove);
    window.addEventListener('touchmove', touchMove);
    window.addEventListener('mouseup', stopDragging);
    window.addEventListener('touchend', stopDragging);
  };

  // فیلتر محصولات
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.includes(search);
    const matchesCategory = selectedCategory
      ? product.categoryid === Number(selectedCategory)
      : true;
    const price = Number(product.price);
    const matchesPrice = price >= priceRange.start && price <= priceRange.end;
    return matchesSearch && matchesCategory && matchesPrice;
  });

  // فرمت کردن عدد
  const formatPrice = (price) => {
    if (!isClient) return '0';
    return price.toLocaleString('fa-IR');
  };

  // پاک کردن فیلترها
  const clearFilters = () => {
    setSearch('');
    setSelectedCategory('');
    setSliderPos({ start: 0, end: 100 });
  };

 

  const FilterContent = ({ includeMobileSearch = false }) => (
    <div className={isMobile ? "space-y-6" : "contents"}>
      {/* جستجو - فقط برای دسکتاپ یا اگر includeMobileSearch درست باشد */}
      {(!isMobile || includeMobileSearch) && (
        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
            <HiOutlineSearch className="w-4 h-4" />
            جستجوی محصول
          </label>
          <div className="relative group">
            <input
              type="text"
              placeholder="نام محصول را جستجو کنید..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pr-12 pl-4 py-4 bg-white/80 backdrop-blur-sm border-2 border-slate-200 rounded-2xl 
                       focus:border-blue-400 focus:ring-4 focus:ring-blue-100 focus:outline-none
                       transition-all duration-300 group-hover:border-slate-300"
            />
            <HiOutlineSearch className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 
                                       group-focus-within:text-blue-500 transition-colors" />
          </div>
        </div>
      )}

      {/* دسته‌بندی */}
      <div className="space-y-2 relative z-20">
        <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
          <HiOutlineTag className="w-4 h-4" />
          دسته‌بندی
        </label>
        <select
          value={selectedCategory}
          onChange={e => setSelectedCategory(e.target.value)}
          className="w-full px-4 py-4 bg-white/80 backdrop-blur-sm border-2 border-slate-200 rounded-2xl 
                   focus:border-blue-400 focus:ring-4 focus:ring-blue-100 focus:outline-none
                   transition-all duration-300 hover:border-slate-300 cursor-pointer appearance-none
                   relative z-30"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e")`,
            backgroundPosition: 'left 0.75rem center',
            backgroundRepeat: 'no-repeat',
            backgroundSize: '1.5em 1.5em'
          }}
        >
          <option value="">همه دسته‌بندی‌ها</option>
          {categories.map(cat => (
            <option key={cat.id} value={cat.id}>{cat.name}</option>
          ))}
        </select>
      </div>

      {/* اسلایدر قیمت */}
      <div className="space-y-2">
        <label className="text-sm font-semibold text-slate-700">محدوده قیمت</label>
        <div className="bg-white/50 rounded-2xl p-4 border border-slate-200">
          <div ref={sliderRef} className="relative h-8 w-full select-none mt-1">
            {/* خط زمینه */}
            <div className="absolute top-1/2 left-0 w-full h-2 bg-slate-200 rounded-full -translate-y-1/2" />
            
            {/* بازه انتخابی */}
            <div
              className="absolute top-1/2 h-2 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-full -translate-y-1/2 shadow-sm"
              style={{
                left: `${sliderPos.start}%`,
                right: `${100 - sliderPos.end}%`
              }}
            />
            
            {/* دایره شروع */}
            <div
              className="absolute top-1/2 -translate-y-1/2 w-6 h-6 bg-white border-3 border-blue-400 rounded-full 
                       cursor-grab active:cursor-grabbing shadow-lg hover:shadow-xl transition-all duration-200 
                       hover:scale-110 z-10"
              style={{ left: `calc(${sliderPos.start}% - 12px)` }}
              onMouseDown={() => handleDragStart('start')}
              onTouchStart={() => handleDragStart('start')}
            />
            
            {/* دایره پایان */}
            <div
              className="absolute top-1/2 -translate-y-1/2 w-6 h-6 bg-white border-3 border-blue-400 rounded-full 
                       cursor-grab active:cursor-grabbing shadow-lg hover:shadow-xl transition-all duration-200 
                       hover:scale-110 z-10"
              style={{ left: `calc(${sliderPos.end}% - 12px)` }}
              onMouseDown={() => handleDragStart('end')}
              onTouchStart={() => handleDragStart('end')}
            />
          </div>
          
          {/* نمایش قیمت‌ها */}
          <div className="flex justify-between mt-4">
            <div className="px-3 py-1 bg-gradient-to-r from-blue-500 to-indigo-500 text-white text-xs font-medium rounded-full shadow-sm">
              <span suppressHydrationWarning>{formatPrice(priceRange.end)} تومان</span>
            </div>
            <div className="px-3 py-1 bg-gradient-to-r from-blue-500 to-indigo-500 text-white text-xs font-medium rounded-full shadow-sm">
              <span suppressHydrationWarning>{formatPrice(priceRange.start)} تومان</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div dir="rtl" className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 overflow-x-hidden">
      <div className="w-full px-4 py-6 space-y-6">
        
        {/* Hero Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-12 h-12 md:w-14 md:h-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-lg mb-4">
            <HiOutlineTag className="w-6 h-6 md:w-8 md:h-8 text-white" />
          </div>
          <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
            مدیریت محصولات
          </h1>
        </div>

        {/* Mobile Search */}
        {isMobile && (
          <div className="w-full">
             <div className="relative">
                <input
                  type="text"
                  placeholder="جستجوی محصول..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="w-full pr-12 pl-4 py-3 bg-gray-50 border border-gray-200 rounded-xl 
                           focus:border-blue-400 focus:ring-2 focus:ring-blue-100 focus:outline-none
                           transition-all duration-300"
                />
                <HiOutlineSearch className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              </div>
          </div>
        )}

        {/* Mobile Filter Button */}
        {isMobile && (
          <div className="w-full">
            <div className="flex justify-between items-center gap-3">
              <button
                onClick={() => setIsFilterOpen(true)}
                className="bg-blue-500 hover:bg-blue-600 text-white px-5 py-3 rounded-xl shadow-lg 
                         flex items-center gap-2 transition-all duration-300"
              >
                <HiOutlineFilter className="w-5 h-5" />
                <span className="text-sm font-medium">فیلترها</span>
              </button>
              <div className="text-sm text-gray-600 bg-white px-4 py-2 rounded-xl shadow-sm border border-gray-200">
                {filteredProducts.length} محصول
              </div>
            </div>
          </div>
        )}

        {/* Desktop Filter Card */}
        {!isMobile && (
          <div className="bg-white/70 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 p-8 relative z-10">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center">
                <HiOutlineFilter className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-xl font-bold text-slate-800">فیلترهای پیشرفته</h2>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <FilterContent />
            </div>
          </div>
        )}

        {/* Mobile Filter Modal */}
        <AnimatePresence>
          {isFilterOpen && isMobile && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/50"
                onClick={() => setIsFilterOpen(false)}
              />
              
              {/* Modal */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ type: "spring", damping: 25, stiffness: 400 }}
                className="relative w-full max-w-sm bg-white rounded-2xl shadow-2xl max-h-[85vh] overflow-hidden"
              >
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-100">
                  <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                    <HiOutlineFilter className="w-5 h-5" />
                    فیلترها
                  </h3>
                  <button
                    onClick={() => setIsFilterOpen(false)}
                    className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 transition-colors"
                  >
                    <HiX className="w-5 h-5" />
                  </button>
                </div>

                {/* Content */}
                <div className="p-4 overflow-y-auto max-h-[60vh]">
                  <FilterContent includeMobileSearch={false} />
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-gray-100 bg-gray-50 flex gap-3">
                  <button
                    onClick={clearFilters}
                    className="flex-1 py-3 rounded-xl bg-white text-gray-700 font-medium hover:bg-gray-100 transition-colors border border-gray-200 text-sm"
                  >
                    پاک کردن
                  </button>
                  <button
                    onClick={() => setIsFilterOpen(false)}
                    className="flex-1 py-3 rounded-xl bg-blue-500 text-white font-medium hover:bg-blue-600 transition-colors text-sm"
                  >
                    نمایش {filteredProducts.length} محصول
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Results Section */}
        <div className="w-full">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-4 md:p-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-lg flex items-center justify-center">
                  <span className="text-white text-sm font-bold">{filteredProducts.length}</span>
                </div>
                <h3 className="text-lg md:text-xl font-bold text-slate-800">نتایج محصولات</h3>
              </div>
              
              {filteredProducts.length > 0 && !isMobile && (
                <div className="px-3 py-2 bg-gradient-to-r from-emerald-100 to-teal-100 text-emerald-700 
                              rounded-full text-sm font-medium border border-emerald-200">
                  {filteredProducts.length} محصول یافت شد
                </div>
              )}
            </div>
            
            {filteredProducts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                {filteredProducts.map(product => (
                  <div key={product.id} className="w-full">
                    <ProductCard
                      product={product}
                      categories={categories}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-20 h-20 bg-gradient-to-br from-slate-100 to-slate-200 rounded-2xl 
                              flex items-center justify-center mx-auto mb-4">
                  <HiOutlineSearch className="w-10 h-10 text-slate-400" />
                </div>
                <h4 className="text-xl font-bold text-slate-600 mb-2">محصولی یافت نشد</h4>
                <p className="text-slate-500 text-sm px-4">
                  متأسفانه با فیلترهای انتخابی شما محصولی پیدا نشد. لطفاً فیلترهای دیگری را امتحان کنید.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}