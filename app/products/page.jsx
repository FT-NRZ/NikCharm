"use client";

import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import ProductCard from "../components/cards/ProductCard";
import Header from "../components/Header";
import { AnimatePresence, motion } from "framer-motion";
import MobileProductCard from "../components/cards/mobileProductCard";

export default function ProductsPage() {
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

  // در ابتدای تابع ProductsPage (بعد از تعریف searchParams)
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

  // تبدیل درصد اسلایدر به قیمت
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
  // --- پایان مدیریت اسلایدر قیمت ---

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

  // بررسی موبایل بودن صفحه
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

  return (
    <>
      <Header />

      <div className="flex flex-col min-h-screen bg-white">
        {/* Main Content */}
        <main dir="rtl" className="flex-1 w-full mx-auto p-6 pb-16">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold text-gray-800">محصولات</h1>
            {/* Filter Button for Mobile */}
            <button
              onClick={() => setIsFilterOpen(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-700 transition md:hidden"
            >
              فیلترها
            </button>
          </div>

          <div className="flex flex-row gap-6 mb-4">
            {/* Desktop Filter Panel */}
            <div className="hidden md:block min-w-[260px] w-[20%] bg-white/70 backdrop-blur-lg h-fit rounded-xl shadow-sm border border-black/30 p-6 ml-auto">
              <h3 className="text-lg font-semibold mb-4">فیلترها</h3>

              {/* Price Range Filter */}
              <div className="mb-4">
                <h4 className="text-md font-medium mb-4">فیلتر قیمت</h4>
                <div ref={sliderRef} className="relative h-8 w-50 mr-2 select-none">
                  {/* خط زمینه */}
                  <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-200 rounded-full -translate-y-1/2" />
                  {/* بازه انتخابی */}
                  <div
                    className="absolute top-1/2 h-1 bg-blue-400 rounded-full -translate-y-1/2"
                    style={{
                      right: `${100 - sliderPos.end}%`,
                      left: `${sliderPos.start}%`
                    }}
                  />
                  {/* دایره شروع */}
                  <div
                    className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-blue-500 rounded-full cursor-grab active:cursor-grabbing shadow transition"
                    style={{ right: `calc(${100 - sliderPos.start}% - 10px)` }}
                    onMouseDown={() => handleDragStart('start')}
                    onTouchStart={() => handleDragStart('start')}
                  />
                  {/* دایره پایان */}
                  <div
                    className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-blue-500 rounded-full cursor-grab active:cursor-grabbing shadow transition"
                    style={{ right: `calc(${100 - sliderPos.end}% - 10px)` }}
                    onMouseDown={() => handleDragStart('end')}
                    onTouchStart={() => handleDragStart('end')}
                  />
                  {/* نمایش قیمت‌ها */}
                  <div className="flex justify-between w-full absolute -top-1 px-1 text-xs text-gray-600 font-bold">
                    <span>{priceRange.start.toLocaleString()} تومان</span>
                    <span>{priceRange.end.toLocaleString()} تومان</span>
                  </div>
                </div>
              </div>

              {/* Categories Filter */}
              <div className="mb-6">
                <h4 className="text-md font-medium mb-2">دسته‌بندی‌ها</h4>
                <div className="flex flex-wrap gap-3">
                  {categories.map((category) => (
                    <label key={category.id} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={selectedCategories.includes(category.id)}
                        onChange={() => handleCategoryChange(category.id)}
                        className="rounded text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-gray-700">{category.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Sorting Options */}
              <div className="mb-6">
                <h4 className="text-md font-medium mb-2">مرتب‌سازی</h4>
                <select
                  value={sortOption}
                  onChange={(e) => setSortOption(e.target.value)}
                  className="w-full p-2 border rounded-lg"
                >
                  <option value="">انتخاب کنید</option>
                  <option value="priceLowToHigh">قیمت: کم به زیاد</option>
                  <option value="priceHighToLow">قیمت: زیاد به کم</option>
                  <option value="bestSelling">پرفروش‌ترین</option>
                </select>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-between mt-6">
                <button
                  onClick={() => {
                    setSliderPos({ start: 0, end: 100 });
                    setSelectedCategories([]);
                    setSortOption("");
                    setIsFilterOpen(false);
                  }}
                  className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300"
                >
                  لغو فیلترها
                </button>
              </div>
            </div>

            {/* Products Grid */}
            <div className="flex flex-wrap w-full gap-4 justify-items-start">
              {filteredProducts
                .filter(product => product.stock_quantity > 0)
                .map((product) => (
                  <div key={product.id}>
                    {isMobile ? (
                      <MobileProductCard product={product} />
                    ) : (
                      <ProductCard product={product} />
                    )}
                  </div>
                ))}
            </div>
          </div>

          {/* No Products Found */}
          {filteredProducts.length === 0 && (
            <div className="text-center text-gray-500 mt-8">
              هیچ محصولی مطابق با فیلترهای انتخابی یافت نشد.
            </div>
          )}
        </main>

        {/* Mobile Filter Panel */}
        <AnimatePresence>
          {isFilterOpen && (
            <div dir="rtl" className="fixed mb-3 pb-16 left-0 top-0 inset-0 z-50 flex">
              {/* Filter Content */}
              <motion.div
                initial={{ x: 1000 }}
                animate={{ x: 0 }}
                exit={{ x: 1000 }}
                transition={{ duration: 0.5 }}
                className="relative w-full bg-white/70 backdrop-blur-lg h-full shadow-lg p-6 ml-auto"
              >
                <button
                  onClick={() => setIsFilterOpen(false)}
                  className="absolute left-4 top-4 z-50 text-3xl text-gray-700 hover:text-red-600 transition"
                  aria-label="بستن فیلتر"
                >
                  ×
                </button>
                <h3 className="text-lg font-semibold mb-4">فیلترها</h3>

                {/* Price Range Filter */}
                <div className="mb-4">
                  <h4 className="text-md font-medium mb-4">فیلتر قیمت</h4>
                  <div ref={sliderRef} className="relative h-8 w-70 select-none">
                    {/* خط زمینه */}
                    <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-200 rounded-full -translate-y-1/2" />
                    {/* بازه انتخابی */}
                    <div
                      className="absolute top-1/2 h-1 bg-blue-400 rounded-full -translate-y-1/2"
                      style={{
                        right: `${100 - sliderPos.end}%`,
                        left: `${sliderPos.start}%`
                      }}
                    />
                    {/* دایره شروع */}
                    <div
                      className="absolute top-1/2 -translate-y-1/2 w-5 h-5 bg-blue-500 rounded-full cursor-grab active:cursor-grabbing shadow transition"
                      style={{ right: `calc(${100 - sliderPos.start}% - 10px)` }}
                      onMouseDown={() => handleDragStart('start')}
                      onTouchStart={() => handleDragStart('start')}
                    />
                    {/* دایره پایان */}
                    <div
                      className="absolute top-1/2 -translate-y-1/2 w-5 h-5 bg-blue-500 rounded-full cursor-grab active:cursor-grabbing shadow transition"
                      style={{ right: `calc(${100 - sliderPos.end}% - 10px)` }}
                      onMouseDown={() => handleDragStart('end')}
                      onTouchStart={() => handleDragStart('end')}
                    />
                    {/* نمایش قیمت‌ها */}
                    <div className="flex justify-between w-full absolute -top-1 px-1 text-xs text-gray-600 font-bold">
                      <span>{priceRange.start.toLocaleString()} تومان</span>
                      <span>{priceRange.end.toLocaleString()} تومان</span>
                    </div>
                  </div>
                </div>

                {/* Categories Filter */}
                <div className="mb-6">
                  <h4 className="text-md font-medium mb-2">دسته‌بندی‌ها</h4>
                  <div className="flex flex-wrap gap-3">
                    {categories.map((category) => (
                      <label
                        key={category.id}
                        className="flex items-center gap-2"
                      >
                        <input
                          type="checkbox"
                          checked={selectedCategories.includes(category.id)}
                          onChange={() => handleCategoryChange(category.id)}
                          className="rounded text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-gray-700">{category.name}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Sorting Options */}
                <div className="mb-6">
                  <h4 className="text-md font-medium mb-2">مرتب‌سازی</h4>
                  <select
                    value={sortOption}
                    onChange={(e) => setSortOption(e.target.value)}
                    className="w-full p-2 border rounded-lg"
                  >
                    <option value="">انتخاب کنید</option>
                    <option value="priceLowToHigh">قیمت: کم به زیاد</option>
                    <option value="priceHighToLow">قیمت: زیاد به کم</option>
                  </select>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-between mt-6">
                  <button
                    onClick={() => setIsFilterOpen(false)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                  >
                    اعمال تغییرات
                  </button>
                  <button
                    onClick={() => {
                      setSliderPos({ start: 0, end: 100 });
                      setSelectedCategories([]);
                      setSortOption("");
                      setIsFilterOpen(false);
                    }}
                    className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300"
                  >
                    لغو فیلترها
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