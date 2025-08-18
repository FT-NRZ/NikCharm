"use client";

import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import ProductCard from "../components/cards/ProductCard";
import Header from "../components/Header";
import { AnimatePresence, motion } from "framer-motion";
import MobileProductCard from "../components/cards/mobileProductCard";
import { Slider, Filter, ChevronRight, X, ShoppingBag, TrendingUp, ArrowDownWideNarrow, ArrowUpWideNarrow } from "lucide-react";

export default function ProductsPage() {
  // استیت‌ها و کدهای قبلی بدون تغییر
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOption, setSortOption] = useState("");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(typeof window !== "undefined" ? window.innerWidth < 768 : false);

  // اسلایدر قیمت
  const [sliderPos, setSliderPos] = useState({ start: 0, end: 100 });
  const [priceRange, setPriceRange] = useState({ start: 0, end: 0 });
  const sliderRef = useRef(null);
  const isDragging = useRef(null);

  const searchParams = useSearchParams();

  // تابع برای تعیین کلاس‌های grid بر اساس اندازه صفحه
  const getGridClasses = () => {
    return "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 3xl:grid-cols-4 gap-4 md:gap-5 justify-items-center";
  };

  useEffect(() => {
    const catParam = searchParams.get("category");
    if (catParam) {
      setSelectedCategories([Number(catParam)]);
    } else {
      setSelectedCategories([]);
    }
  }, [searchParams]);

  // گرفتن محصولات و دسته‌بندی‌ها از دیتابیس
  useEffect(() => {
    fetch("/api/products")
      .then(res => res.json())
      .then(data => {
        const prods = data.products || [];
        setProducts(prods);
        setFilteredProducts(prods);
      });

    fetch("/api/categories")
      .then(res => res.json())
      .then(data => setCategories(data.categories || []));
  }, [searchParams]);

  // مقدار اولیه اسلایدر قیمت
  useEffect(() => {
    const prices = products.map((p) => Number(p.price)).filter(Boolean);
    const minPrice = prices.length ? Math.min(...prices) : 0;
    const maxPrice = prices.length ? Math.max(...prices) : 1000000;
    setSliderPos({ start: 0, end: 100 });
    setPriceRange({ start: minPrice, end: maxPrice });
  }, [products]);

  useEffect(() => {
    const prices = products.map((p) => Number(p.price)).filter(Boolean);
    const minPrice = prices.length ? Math.min(...prices) : 0;
    const maxPrice = prices.length ? Math.max(...prices) : 1000000;
    const startPrice = Math.round(minPrice + (sliderPos.start / 100) * (maxPrice - minPrice));
    const endPrice = Math.round(minPrice + (sliderPos.end / 100) * (maxPrice - minPrice));
    setPriceRange({ start: startPrice, end: endPrice });
  }, [sliderPos, products]);

  // --- اسلایدر قیمت: مدیریت درگ ---
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

  // فیلتر کردن محصولات
  useEffect(() => {
    let filtered = products;

    // فیلتر بر اساس بازه قیمت
    filtered = filtered.filter(
      (product) =>
        Number(product.price) >= priceRange.start && Number(product.price) <= priceRange.end
    );

    // فیلتر بر اساس دسته‌بندی
    if (selectedCategories.length > 0) {
      filtered = filtered.filter((product) => {
        if (Array.isArray(product.categories)) {
          return product.categories.some(cat =>
            typeof cat === "object"
              ? selectedCategories.includes(cat.id)
              : selectedCategories.includes(cat)
          );
        } else if (product.categories && typeof product.categories === "object") {
          return selectedCategories.includes(product.categories.id);
        }
        return false;
      });
    }

    // فیلتر بر اساس جستجو
    if (searchQuery) {
      filtered = filtered.filter((product) =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // مرتب‌سازی
    if (sortOption === "priceLowToHigh") {
      filtered = filtered.sort((a, b) => a.price - b.price);
    } else if (sortOption === "priceHighToLow") {
      filtered = filtered.sort((a, b) => b.price - a.price);
    } else if (sortOption === "bestSelling") {
      filtered = filtered.sort((a, b) => (b.sales || 0) - (a.sales || 0));
    }

    setFilteredProducts(filtered);
  }, [priceRange, selectedCategories, searchQuery, sortOption, products]);

  // انتخاب دسته‌بندی
  const handleCategoryChange = (categoryId) => {
    setSelectedCategories((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  useEffect(() => {
    const handleResize = () => {
      const isCurrentlyMobile = window.innerWidth < 768;
      if (isMobile !== isCurrentlyMobile) {
        setIsMobile(isCurrentlyMobile);
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [isMobile]);

  // تابع برای نمایش تعداد محصولات
  const getProductsCountText = () => {
    const count = filteredProducts.filter(product => product.stock_quantity > 0).length;
    return `${count} محصول`;
  };

  return (
    <>
      <Header />

      <div className="flex flex-col min-h-screen bg-white">
        {/* Hero Section with decorative patterns */}
        <section className="relative py-24 bg-[#0F2C59] overflow-hidden">
          {/* پترن‌های خطی تزئینی */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute -rotate-45 top-0 right-1/4 w-96 h-96 border-t-8 border-r-8 border-white rounded-full"></div>
            <div className="absolute -rotate-12 bottom-0 left-1/3 w-80 h-80 border-b-8 border-l-8 border-white rounded-full"></div>
            <div className="absolute top-1/2 left-1/4 w-64 h-64 border-4 border-white rounded-full"></div>
            <div className="absolute bottom-1/4 right-1/4 w-40 h-40 border-2 border-white rounded-full"></div>
          </div>
          
          <div className="relative container mx-auto px-6 text-center">
            <h1 className="text-white text-4xl md:text-5xl font-bold mb-6">محصولات نیک چرم</h1>
            <p className="text-white/90 text-xl md:text-xl mb-8 max-w-3xl mx-auto">
              کیفیت برتر با قیمتی مناسب، با محصولات ما
            </p>
            <div className="w-20 h-1 bg-white/80 mx-auto rounded-full"></div>
          </div>
        </section>

        {/* Main Content */}
        <main dir="rtl" className="flex-1 container mx-auto p-4 md:p-6 lg:p-8 pb-16">
          <div className="flex items-center justify-between mb-6 mt-4">
            <div className="flex items-center">
              <h2 className="text-xl md:text-2xl font-bold text-gray-800">محصولات</h2>
              <span className="mr-3 text-sm bg-[#0F2C59]/10 text-[#0F2C59] py-1 px-3 rounded-full">
                {getProductsCountText()}
              </span>
            </div>
            
            {/* Filter Button - فقط در حالت موبایل */}
            {isMobile && (
              <button
                onClick={() => setIsFilterOpen(true)}
                className="bg-[#0F2C59] text-white px-4 py-2 rounded-2xl shadow-md hover:bg-[#1A3D70] transition-all transform hover:scale-105 flex items-center space-x-1"
              >
                <Filter size={16} />
                <span>فیلترها</span>
              </button>
            )}
          </div>

          <div className="flex flex-row gap-6 mb-4">
            {/* Desktop Filter Panel - باکس با ارتفاع محتوا */}
            <div className="hidden md:block min-w-[280px] w-[22%] bg-white rounded-xl shadow-lg border border-gray-100 p-5 ml-auto sticky top-20 self-start z-10">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-800 flex items-center">
                  <Filter size={18} className="ml-2" />
                  فیلترها
                </h3>
                {selectedCategories.length > 0 || sortOption || sliderPos.start > 0 || sliderPos.end < 100 ? (
                  <button
                    onClick={() => {
                      setSliderPos({ start: 0, end: 100 });
                      setSelectedCategories([]);
                      setSortOption("");
                    }}
                    className="text-xs text-[#0F2C59] hover:text-[#1A3D70] underline"
                  >
                    لغو فیلترها
                  </button>
                ) : null}
              </div>

              {/* Price Range Filter */}
              <div className="mb-6">
                <h4 className="text-md font-medium mb-3 flex items-center text-gray-700">
                  <span className="w-1 h-5 bg-[#0F2C59] rounded-full inline-block ml-2"></span>
                  فیلتر قیمت
                </h4>
                <div ref={sliderRef} className="relative h-10 w-full select-none mt-4">
                  <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-200 rounded-full -translate-y-1/2" />
                  <div
                    className="absolute top-1/2 h-1 bg-gradient-to-r from-[#0F2C59] to-[#1A3D70] rounded-full -translate-y-1/2"
                    style={{
                      right: `${100 - sliderPos.end}%`,
                      left: `${sliderPos.start}%`
                    }}
                  />
                  <div
                    className="absolute top-1/2 -translate-y-1/2 w-5 h-5 bg-white border-2 border-[#0F2C59] rounded-full cursor-grab active:cursor-grabbing shadow-md hover:shadow-lg transition transform hover:scale-110"
                    style={{ right: `calc(${100 - sliderPos.start}% - 10px)` }}
                    onMouseDown={() => handleDragStart('start')}
                    onTouchStart={() => handleDragStart('start')}
                  />
                  <div
                    className="absolute top-1/2 -translate-y-1/2 w-5 h-5 bg-white border-2 border-[#0F2C59] rounded-full cursor-grab active:cursor-grabbing shadow-md hover:shadow-lg transition transform hover:scale-110"
                    style={{ right: `calc(${100 - sliderPos.end}% - 10px)` }}
                    onMouseDown={() => handleDragStart('end')}
                    onTouchStart={() => handleDragStart('end')}
                  />
                  <div className="flex justify-between w-full absolute -bottom-3 px-1 text-xs font-medium text-gray-600">
                    <div className="bg-[#0F2C59]/10 px-2 py-0.5 rounded-md shadow-sm">
                      {priceRange.end.toLocaleString()} تومان
                    </div>
                    <div className="bg-[#0F2C59]/10 px-2 py-0.5 rounded-md shadow-sm">
                      {priceRange.start.toLocaleString()} تومان
                    </div>
                  </div>
                </div>
                <div className="h-4"></div>
              </div>

              {/* Categories Filter */}
              <div className="mb-6">
                <h4 className="text-md font-medium mb-3 flex items-center text-gray-700">
                  <span className="w-1 h-5 bg-[#0F2C59] rounded-full inline-block ml-2"></span>
                  دسته‌بندی‌ها
                </h4>
                <div className="space-y-2 mt-1">
                  {categories.map((category) => (
                    <label 
                      key={category.id} 
                      className={`flex items-center p-1.5 rounded-lg transition-all cursor-pointer hover:bg-[#0F2C59]/5 ${
                        selectedCategories.includes(category.id) ? 'bg-[#0F2C59]/5 border-r-4 border-[#0F2C59]' : ''
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={selectedCategories.includes(category.id)}
                        onChange={() => handleCategoryChange(category.id)}
                        className="rounded text-[#0F2C59] focus:ring-[#0F2C59] hidden"
                      />
                      <div className={`w-5 h-5 rounded border ${
                        selectedCategories.includes(category.id) 
                          ? 'bg-[#0F2C59] border-[#0F2C59] flex items-center justify-center' 
                          : 'border-gray-300'
                      } ml-2`}>
                        {selectedCategories.includes(category.id) && (
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                      <span className="text-gray-700">{category.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Sorting Options */}
              <div className="mb-4">
                <h4 className="text-md font-medium mb-3 flex items-center text-gray-700">
                  <span className="w-1 h-5 bg-[#0F2C59] rounded-full inline-block ml-2"></span>
                  مرتب‌سازی
                </h4>
                <div className="space-y-2 mt-1">
                  <label className={`flex items-center p-1.5 rounded-lg transition-all cursor-pointer hover:bg-[#0F2C59]/5 ${
                    sortOption === "priceLowToHigh" ? 'bg-[#0F2C59]/5 border-r-4 border-[#0F2C59]' : ''
                  }`}>
                    <input
                      type="radio"
                      name="sort"
                      checked={sortOption === "priceLowToHigh"}
                      onChange={() => setSortOption("priceLowToHigh")}
                      className="hidden"
                    />
                    <div className={`w-4 h-4 rounded-full border ${
                      sortOption === "priceLowToHigh" 
                        ? 'border-[#0F2C59] flex items-center justify-center' 
                        : 'border-gray-300'
                    } ml-2`}>
                      {sortOption === "priceLowToHigh" && (
                        <div className="w-2 h-2 rounded-full bg-[#0F2C59]"></div>
                      )}
                    </div>
                    <span className="text-gray-700 flex items-center">
                      <ArrowDownWideNarrow size={14} className="ml-1" />
                      قیمت: کم به زیاد
                    </span>
                  </label>
                  
                  <label className={`flex items-center p-1.5 rounded-lg transition-all cursor-pointer hover:bg-[#0F2C59]/5 ${
                    sortOption === "priceHighToLow" ? 'bg-[#0F2C59]/5 border-r-4 border-[#0F2C59]' : ''
                  }`}>
                    <input
                      type="radio"
                      name="sort"
                      checked={sortOption === "priceHighToLow"}
                      onChange={() => setSortOption("priceHighToLow")}
                      className="hidden"
                    />
                    <div className={`w-4 h-4 rounded-full border ${
                      sortOption === "priceHighToLow" 
                        ? 'border-[#0F2C59] flex items-center justify-center' 
                        : 'border-gray-300'
                    } ml-2`}>
                      {sortOption === "priceHighToLow" && (
                        <div className="w-2 h-2 rounded-full bg-[#0F2C59]"></div>
                      )}
                    </div>
                    <span className="text-gray-700 flex items-center">
                      <ArrowUpWideNarrow size={14} className="ml-1" />
                      قیمت: زیاد به کم
                    </span>
                  </label>
                  
                  <label className={`flex items-center p-1.5 rounded-lg transition-all cursor-pointer hover:bg-[#0F2C59]/5 ${
                    sortOption === "bestSelling" ? 'bg-[#0F2C59]/5 border-r-4 border-[#0F2C59]' : ''
                  }`}>
                    <input
                      type="radio"
                      name="sort"
                      checked={sortOption === "bestSelling"}
                      onChange={() => setSortOption("bestSelling")}
                      className="hidden"
                    />
                    <div className={`w-4 h-4 rounded-full border ${
                      sortOption === "bestSelling" 
                        ? 'border-[#0F2C59] flex items-center justify-center' 
                        : 'border-gray-300'
                    } ml-2`}>
                      {sortOption === "bestSelling" && (
                        <div className="w-2 h-2 rounded-full bg-[#0F2C59]"></div>
                      )}
                    </div>
                    <span className="text-gray-700 flex items-center">
                      <TrendingUp size={14} className="ml-1" />
                      پرفروش‌ترین
                    </span>
                  </label>
                </div>
              </div>
            </div>

            {/* Products Grid - اضافه کردن max-width برای هر کارت */}
            <div className="w-full">
              {filteredProducts.filter(product => product.stock_quantity > 0).length > 0 ? (
                <div className={getGridClasses()}>
                  {filteredProducts
                    .filter(product => product.stock_quantity > 0)
                    .map((product) => (
                      <motion.div 
                        key={product.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                        className="w-full max-w-sm mx-auto"
                      >
                        {isMobile ? (
                          <MobileProductCard product={product} />
                        ) : (
                          <ProductCard product={product} />
                        )}
                      </motion.div>
                    ))}
                </div>
              ) : (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex flex-col items-center justify-center bg-white rounded-xl shadow-md p-8 mt-4 text-center"
                >
                  <div className="bg-[#0F2C59]/10 p-4 rounded-full mb-4">
                    <ShoppingBag size={32} className="text-[#0F2C59]" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-700 mb-2">محصولی یافت نشد</h3>
                  <p className="text-gray-500 mb-6 max-w-md">
                    هیچ محصولی مطابق با فیلترهای انتخابی شما یافت نشد. لطفاً فیلترهای دیگری را امتحان کنید.
                  </p>
                  <button
                    onClick={() => {
                      setSliderPos({ start: 0, end: 100 });
                      setSelectedCategories([]);
                      setSortOption("");
                      setIsFilterOpen(false);
                    }}
                    className="bg-[#0F2C59] text-white px-6 py-2 rounded-full hover:bg-[#1A3D70] transition-colors"
                  >
                    پاک کردن فیلترها
                  </button>
                </motion.div>
              )}
            </div>
          </div>
        </main>

        {/* Mobile Filter Panel - بقیه کد بدون تغییر */}
        <AnimatePresence>
          {isFilterOpen && (
            <div dir="rtl" className="fixed left-0 top-0 inset-0 z-50 flex">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/30 backdrop-blur-sm"
                onClick={() => setIsFilterOpen(false)}
              />
              
              {/* Filter Content */}
              <motion.div
                initial={{ x: "100%" }}
                animate={{ x: 0 }}
                exit={{ x: "100%" }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                className="relative w-[90%] max-w-md bg-white h-full shadow-xl p-6 ml-auto overflow-y-auto"
              >
                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-xl font-bold text-gray-800 flex items-center">
                    <Filter size={20} className="ml-2" />
                    فیلترها
                  </h3>
                  <button
                    onClick={() => setIsFilterOpen(false)}
                    className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200"
                  >
                    <X size={18} />
                  </button>
                </div>

                {/* Price Range Filter */}
                <div className="mb-8">
                  <h4 className="text-md font-medium mb-4 flex items-center text-gray-700">
                    <span className="w-1 h-5 bg-[#0F2C59] rounded-full inline-block ml-2"></span>
                    فیلتر قیمت
                  </h4>
                  <div ref={sliderRef} className="relative h-10 w-full select-none mt-6">
                    <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-200 rounded-full -translate-y-1/2" />
                    <div
                      className="absolute top-1/2 h-1 bg-gradient-to-r from-[#0F2C59] to-[#1A3D70] rounded-full -translate-y-1/2"
                      style={{
                        right: `${100 - sliderPos.end}%`,
                        left: `${sliderPos.start}%`
                      }}
                    />
                    <div
                      className="absolute top-1/2 -translate-y-1/2 w-6 h-6 bg-white border-2 border-[#0F2C59] rounded-full cursor-grab active:cursor-grabbing shadow-md transition"
                      style={{ right: `calc(${100 - sliderPos.start}% - 12px)` }}
                      onMouseDown={() => handleDragStart('start')}
                      onTouchStart={() => handleDragStart('start')}
                    />
                    <div
                      className="absolute top-1/2 -translate-y-1/2 w-6 h-6 bg-white border-2 border-[#0F2C59] rounded-full cursor-grab active:cursor-grabbing shadow-md transition"
                      style={{ right: `calc(${100 - sliderPos.end}% - 12px)` }}
                      onMouseDown={() => handleDragStart('end')}
                      onTouchStart={() => handleDragStart('end')}
                    />
                    <div className="flex justify-between w-full absolute -bottom-4 px-1 text-xs font-medium text-gray-600">
                      <div className="bg-[#0F2C59]/10 px-2 py-0.5 rounded-md shadow-sm">
                        {priceRange.end.toLocaleString()} تومان
                      </div>
                      <div className="bg-[#0F2C59]/10 px-2 py-0.5 rounded-md shadow-sm">
                        {priceRange.start.toLocaleString()} تومان
                      </div>
                    </div>
                  </div>
                  <div className="h-6"></div>
                </div>

                {/* Categories Filter */}
                <div className="mb-8">
                  <h4 className="text-md font-medium mb-4 flex items-center text-gray-700">
                    <span className="w-1 h-5 bg-[#0F2C59] rounded-full inline-block ml-2"></span>
                    دسته‌بندی‌ها
                  </h4>
                  <div className="space-y-3 mt-2">
                    {categories.map((category) => (
                      <label 
                        key={category.id} 
                        className={`flex items-center p-2 rounded-lg transition-all cursor-pointer hover:bg-[#0F2C59]/5 ${
                          selectedCategories.includes(category.id) ? 'bg-[#0F2C59]/5 border-r-4 border-[#0F2C59]' : ''
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={selectedCategories.includes(category.id)}
                          onChange={() => handleCategoryChange(category.id)}
                          className="rounded text-[#0F2C59] focus:ring-[#0F2C59] hidden"
                        />
                        <div className={`w-5 h-5 rounded border ${
                          selectedCategories.includes(category.id) 
                            ? 'bg-[#0F2C59] border-[#0F2C59] flex items-center justify-center' 
                            : 'border-gray-300'
                        } ml-2`}>
                          {selectedCategories.includes(category.id) && (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </div>
                        <span className="text-gray-700">{category.name}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Sorting Options */}
                <div className="mb-8">
                  <h4 className="text-md font-medium mb-4 flex items-center text-gray-700">
                    <span className="w-1 h-5 bg-[#0F2C59] rounded-full inline-block ml-2"></span>
                    مرتب‌سازی
                  </h4>
                  <div className="space-y-3 mt-2">
                    <label className={`flex items-center p-2 rounded-lg transition-all cursor-pointer hover:bg-[#0F2C59]/5 ${
                      sortOption === "priceLowToHigh" ? 'bg-[#0F2C59]/5 border-r-4 border-[#0F2C59]' : ''
                    }`}>
                      <input
                        type="radio"
                        name="sort"
                        checked={sortOption === "priceLowToHigh"}
                        onChange={() => setSortOption("priceLowToHigh")}
                        className="hidden"
                      />
                      <div className={`w-4 h-4 rounded-full border ${
                        sortOption === "priceLowToHigh" 
                          ? 'border-[#0F2C59] flex items-center justify-center' 
                          : 'border-gray-300'
                      } ml-2`}>
                        {sortOption === "priceLowToHigh" && (
                          <div className="w-2 h-2 rounded-full bg-[#0F2C59]"></div>
                        )}
                      </div>
                      <span className="text-gray-700 flex items-center">
                        <ArrowDownWideNarrow size={14} className="ml-1" />
                        قیمت: کم به زیاد
                      </span>
                    </label>
                    
                    <label className={`flex items-center p-2 rounded-lg transition-all cursor-pointer hover:bg-[#0F2C59]/5 ${
                      sortOption === "priceHighToLow" ? 'bg-[#0F2C59]/5 border-r-4 border-[#0F2C59]' : ''
                    }`}>
                      <input
                        type="radio"
                        name="sort"
                        checked={sortOption === "priceHighToLow"}
                        onChange={() => setSortOption("priceHighToLow")}
                        className="hidden"
                      />
                      <div className={`w-4 h-4 rounded-full border ${
                        sortOption === "priceHighToLow" 
                          ? 'border-[#0F2C59] flex items-center justify-center' 
                          : 'border-gray-300'
                      } ml-2`}>
                        {sortOption === "priceHighToLow" && (
                          <div className="w-2 h-2 rounded-full bg-[#0F2C59]"></div>
                        )}
                      </div>
                      <span className="text-gray-700 flex items-center">
                        <ArrowUpWideNarrow size={14} className="ml-1" />
                        قیمت: زیاد به کم
                      </span>
                    </label>
                    
                    <label className={`flex items-center p-2 rounded-lg transition-all cursor-pointer hover:bg-[#0F2C59]/5 ${
                      sortOption === "bestSelling" ? 'bg-[#0F2C59]/5 border-r-4 border-[#0F2C59]' : ''
                    }`}>
                      <input
                        type="radio"
                        name="sort"
                        checked={sortOption === "bestSelling"}
                        onChange={() => setSortOption("bestSelling")}
                        className="hidden"
                      />
                      <div className={`w-4 h-4 rounded-full border ${
                        sortOption === "bestSelling" 
                          ? 'border-[#0F2C59] flex items-center justify-center' 
                          : 'border-gray-300'
                      } ml-2`}>
                        {sortOption === "bestSelling" && (
                          <div className="w-2 h-2 rounded-full bg-[#0F2C59]"></div>
                        )}
                      </div>
                      <span className="text-gray-700 flex items-center">
                        <TrendingUp size={14} className="ml-1" />
                        پرفروش‌ترین
                      </span>
                    </label>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="relative p-4 bg-white border-t border-gray-200 flex gap-3 mt-6">
                  <button
                    onClick={() => {
                      setSliderPos({ start: 0, end: 100 });
                      setSelectedCategories([]);
                      setSortOption("");
                    }}
                    className="flex-1 py-3 rounded-xl bg-gray-100 text-gray-700 font-medium hover:bg-gray-200 transition-colors flex justify-center items-center"
                  >
                    پاک کردن فیلترها
                  </button>
                  <button
                    onClick={() => setIsFilterOpen(false)}
                    className="flex-1 py-3 rounded-xl bg-[#0F2C59] text-white font-medium hover:bg-[#1A3D70] transition-colors flex justify-center items-center"
                  >
                    مشاهده {filteredProducts.filter(p => p.stock_quantity > 0).length} محصول
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}