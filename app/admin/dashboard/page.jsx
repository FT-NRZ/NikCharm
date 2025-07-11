'use client';
import ProductCard from '../../../app/components/cards/ProductCard';
import { useState, useRef, useEffect } from 'react';
import { HiOutlineSearch } from "react-icons/hi";

export default function DashboardPage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  // گرفتن محصولات و دسته‌بندی‌ها از دیتابیس
  useEffect(() => {
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
  const maxPrice = prices.length ? Math.max(...prices) : 0;

  // اسلایدر قیمت
  const [sliderPos, setSliderPos] = useState({ start: 0, end: 100 });
  const [priceRange, setPriceRange] = useState({ start: minPrice, end: maxPrice });
  const sliderRef = useRef(null);
  const isDragging = useRef(null);

  useEffect(() => {
    const startPrice = Math.round(minPrice + (sliderPos.start / 100) * (maxPrice - minPrice));
    const endPrice = Math.round(minPrice + (sliderPos.end / 100) * (maxPrice - minPrice));
    setPriceRange({ start: startPrice, end: endPrice });
  }, [sliderPos, minPrice, maxPrice]);

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

  return (
    <div>
      <h1 className="text-2xl font-bold text-blue-700 mb-6">همه محصولات</h1>
      <div className="flex flex-wrap gap-4 mb-10 items-center">
        {/* جستجو */}
        <div className="flex items-center bg-gray-100 rounded-xl px-3 py-2">
          <HiOutlineSearch className="text-gray-400 mr-2" />
          <input
            type="text"
            placeholder="جستجو محصول..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="bg-transparent outline-none text-right"
          />
        </div>
        {/* دسته‌بندی */}
        <select
          value={selectedCategory}
          onChange={e => setSelectedCategory(e.target.value)}
          className="bg-gray-100 rounded-xl px-3 py-2 text-gray-700"
        >
          <option value="">دسته‌بندی (همه)</option>
          {categories.map(cat => (
            <option key={cat.id} value={cat.id}>{cat.name}</option>
          ))}
        </select>
        {/* اسلایدر قیمت */}
        <div className="flex flex-col mx-5 gap-1 min-w-[220px]">
          <label className="text-sm text-blue-700 text-right font-bold">فیلتر قیمت</label>
          <div ref={sliderRef} className="relative h-8 w-48 select-none">
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
            <div className="flex justify-between w-full mt-7 px-1 text-xs text-gray-600 font-bold">
              <span>{priceRange.end.toLocaleString()} تومان</span>
              <span>{priceRange.start.toLocaleString()} تومان</span>
            </div>
          </div>
        </div>
      </div>
      <div className="flex flex-wrap gap-6">
        {filteredProducts.map(product => (
          <ProductCard
            key={product.id}
            product={product}
            categories={categories}
          />
        ))}
        {filteredProducts.length === 0 && (
          <div className="text-gray-400 text-center w-full mt-10">محصولی یافت نشد.</div>
        )}
      </div>
    </div>
  );
}