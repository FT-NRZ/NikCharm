"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation"; // Import useSearchParams
import productsData from "../data/products.json"; // Import products data
import categoriesData from "../data/categories.json"; // Import categories data
import ProductCard from "../components/cards/ProductCard";
import Header from "../components/Header"; // Import Header component
import { AnimatePresence, motion } from "framer-motion";
import MobileProductCard from "../components/cards/mobileProductCard";

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [priceRange, setPriceRange] = useState([0, 0]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOption, setSortOption] = useState("");
  const [isFilterOpen, setIsFilterOpen] = useState(false); // State for filter panel
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768); // State to check if the screen is mobile

  const searchParams = useSearchParams(); // Get query parameters

  // Lock scrolling when filter panel is open
  useEffect(() => {
    if (isFilterOpen) {
      document.body.style.overflow = "hidden"; // Disable scrolling
    } else {
      document.body.style.overflow = ""; // Re-enable scrolling
    }

    // Cleanup on component unmount
    return () => {
      document.body.style.overflow = "";
    };
  }, [isFilterOpen]);

  // Load products and set initial price range
  useEffect(() => {
    const allProducts = productsData.products;
    setProducts(allProducts);
    setFilteredProducts(allProducts);

    const maxPrice = Math.max(...allProducts.map((product) => product.price));
    setPriceRange([0, maxPrice]);

    // Check for category filter in query parameters
    const categoryFilter = searchParams.get("category");
    if (categoryFilter) {
      setSelectedCategories([parseInt(categoryFilter)]);
    }
  }, [searchParams]);

  // Handle filtering products
  useEffect(() => {
    let filtered = products;

    // Filter by price range
    filtered = filtered.filter(
      (product) =>
        product.price >= priceRange[0] && product.price <= priceRange[1]
    );

    // Filter by selected categories
    if (selectedCategories.length > 0) {
      filtered = filtered.filter((product) =>
        product.categoryIds.some((id) => selectedCategories.includes(id))
      );
    }

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter((product) =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Sort products
    if (sortOption === "priceLowToHigh") {
      filtered = filtered.sort((a, b) => a.price - b.price);
    } else if (sortOption === "priceHighToLow") {
      filtered = filtered.sort((a, b) => b.price - a.price);
    }

    setFilteredProducts(filtered);
  }, [priceRange, selectedCategories, searchQuery, sortOption, products]);

  // Handle category selection
  const handleCategoryChange = (categoryId) => {
    setSelectedCategories((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  // Check if the screen is mobile
  useEffect(() => {
    const handleResize = () => {
      const isCurrentlyMobile = window.innerWidth < 768;
      if (isMobile !== isCurrentlyMobile) {
        setIsMobile(isCurrentlyMobile);
      }
    };

    handleResize(); // Initial check
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [isMobile]);

  return (
    <>
      {/* Header */}
      <Header />
      {/* Navbar */}
      <Navbar />

      {/* Main Content */}
      <div dir="rtl" className="w-full h-full mx-auto p-6 pb-16 bg-white">
        <div className="flex items-center justify-between mb-6">
          <h1 className=" text-3xl font-bold text-gray-800">محصولات</h1>

          {/* Filter Button for Mobile */}
          <button
            onClick={() => setIsFilterOpen(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-700 transition md:hidden"
          >
            فیلترها
          </button>
        </div>

        <div className="flex flex-row justify-evenly w-svw h-svh mb-4">
          {/* Desktop Filter Panel */}
          <div className="hidden md:block relative min-w-[300px] w-[20%] bg-white/70 backdrop-blur-lg h-fit rounded-xl shadow-sm border border-black/30 p-6 ml-auto">
            <h3 className="text-lg font-semibold mb-4">فیلترها</h3>

            {/* Price Range Filter */}
            <div className="mb-6">
              <h4 className="text-md font-medium mb-2">فیلتر قیمت</h4>
              <div className="flex items-center gap-4">
                <input
                  type="number"
                  value={priceRange[0]}
                  onChange={(e) =>
                    setPriceRange([+e.target.value, priceRange[1]])
                  }
                  className="w-full p-2 border rounded-lg"
                  placeholder="حداقل قیمت"
                />
                <input
                  type="number"
                  value={priceRange[1]}
                  onChange={(e) =>
                    setPriceRange([priceRange[0], +e.target.value])
                  }
                  className="w-full p-2 border rounded-lg"
                  placeholder="حداکثر قیمت"
                />
              </div>
            </div>

            {/* Categories Filter */}
            <div className="mb-6">
              <h4 className="text-md font-medium mb-2">دسته‌بندی‌ها</h4>
              <div className="flex flex-wrap gap-3">
                {categoriesData.categories.map((category) => (
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
              </select>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-between mt-6">
              <button
                onClick={() => {
                  setPriceRange([0, Math.max(...products.map((p) => p.price))]);
                  setSelectedCategories([]);
                  setSortOption("");
                  setIsFilterOpen(false);
                }}
                className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300"
              >
                لغو فیلترها
              </button>
            </div>

            {/* Close Button */}
            <button
              onClick={() => setIsFilterOpen(false)}
              className="absolute top-6 left-7 text-gray-500 hover:text-gray-700"
            >
              بستن
            </button>
          </div>
          {/* Products Grid */}
          <div className="flex flex-wrap w-[75%] gap-4 justify-items-start">
            {/* Search Bar */}
            {filteredProducts.map((product) => (
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
      </div>

      {/* Mobile Filter Panel */}
      <AnimatePresence>
        {isFilterOpen && (
          <div dir="rtl" className="fixed pb-16 left-0 top-0 inset-0 z-50 flex">
            {/* Filter Content */}

            <motion.div
              initial={{ x: 1000 }}
              animate={{ x: 0 }}
              exit={{ x: 1000 }}
              transition={{ duration: 0.5 }}
              className="relative w-full bg-white/70 backdrop-blur-lg h-full shadow-lg p-6 ml-auto"
            >
              <h3 className="text-lg font-semibold mb-4">فیلترها</h3>

              {/* Price Range Filter */}
              <div className="mb-6">
                <h4 className="text-md font-medium mb-2">فیلتر قیمت</h4>
                <div className="flex items-center gap-4">
                  <input
                    type="number"
                    value={priceRange[0]}
                    onChange={(e) =>
                      setPriceRange([+e.target.value, priceRange[1]])
                    }
                    className="w-full p-2 border rounded-lg"
                    placeholder="حداقل قیمت"
                  />
                  <input
                    type="number"
                    value={priceRange[1]}
                    onChange={(e) =>
                      setPriceRange([priceRange[0], +e.target.value])
                    }
                    className="w-full p-2 border rounded-lg"
                    placeholder="حداکثر قیمت"
                  />
                </div>
              </div>

              {/* Categories Filter */}
              <div className="mb-6">
                <h4 className="text-md font-medium mb-2">دسته‌بندی‌ها</h4>
                <div className="flex flex-wrap gap-3">
                  {categoriesData.categories.map((category) => (
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
                    setPriceRange([
                      0,
                      Math.max(...products.map((p) => p.price)),
                    ]);
                    setSelectedCategories([]);
                    setSortOption("");
                    setIsFilterOpen(false);
                  }}
                  className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300"
                >
                  لغو فیلترها
                </button>
              </div>

              {/* Close Button */}
              <button
                onClick={() => setIsFilterOpen(false)}
                className="absolute top-6 left-7 text-gray-500 hover:text-gray-700"
              >
                بستن
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}