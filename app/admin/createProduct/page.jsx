"use client";
import { useState } from "react";

export default function CreateProduct() {
  const [formData, setFormData] = useState({
    name: "",
    categoryIds: [],
    material: "",
    color: "",
    originalPrice: "",
    discountPercent: "",
    dimensions: { length: "", width: "", height: "" },
    description: "",
    images: [],
    isOnSale: false,
    isBestSelling: false,
    productCode: "",
  });

  const [previewImages, setPreviewImages] = useState([]);
  const [previewProduct, setPreviewProduct] = useState(null);

  const categories = [
    { id: 1, name: "زنانه" },
    { id: 2, name: "مردانه" },
    { id: 3, name: "اکسسوری" },
  ];
  const materials = ["چرم طبیعی", "چرم مصنوعی", "پارچه", "دیگر مواد"];
  const colors = ["مشکی", "قهوه ای روشن", "قهوه ای تیره", "جیگری", "صورتی"];

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    const newPreview = files.map((file) => URL.createObjectURL(file));
    setPreviewImages([...previewImages, ...newPreview]);
    setFormData({
      ...formData,
      images: [...formData.images, ...files.map((f) => `/uploads/${f.name}`)],
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation for required fields
    if (
      !formData.name ||
      !formData.originalPrice ||
      formData.categoryIds.length === 0 ||
      formData.images.length === 0
    ) {
      alert("لطفا فیلدهای اجباری (*) را پر کنید");
      return;
    }

    // Calculate final price based on discount
    const finalPrice = formData.discountPercent
      ? formData.originalPrice - (formData.originalPrice * formData.discountPercent) / 100
      : formData.originalPrice;

    const newProduct = {
      id: Date.now(),
      ...formData,
      price: finalPrice,
      originalPrice: Number(formData.originalPrice),
      discountPercent: formData.discountPercent ? Number(formData.discountPercent) : 0,
      dimensions: {
        length: Number(formData.dimensions.length),
        width: Number(formData.dimensions.width),
        height: Number(formData.dimensions.height),
      },
      isOnSale: formData.discountPercent > 0,
      createdAt: new Date().toISOString(),
    };

    try {
      const response = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newProduct),
      });

      if (response.ok) {
        setPreviewProduct(newProduct);
        setFormData({
          name: "",
          categoryIds: [],
          material: "",
          color: "",
          originalPrice: "",
          discountPercent: "",
          dimensions: { length: "", width: "", height: "" },
          description: "",
          images: [],
          isOnSale: false,
          isBestSelling: false,
          productCode: "",
        });
        setPreviewImages([]);
        alert("محصول با موفقیت ایجاد شد!");
      }
    } catch (error) {
      console.error("خطا:", error);
      alert("خطا در ذخیره اطلاعات");
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      <div className="max-w-6xl w-full md:border-1 text-right mt-4 p-6 bg-white rounded-lg shadow-xl">
        <h1 className="text-2xl font-bold mb-6 text-gray-800 text-right">ایجاد محصول جدید</h1>

        <form onSubmit={handleSubmit} className="space-y-6 w-full">
          {/* نام محصول */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">نام محصول *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 text-right"
            />
          </div>

          {/* دسته‌بندی‌ها */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">دسته‌بندی‌ها *</label>
            <div className="flex flex-wrap gap-3 justify-end">
              {categories.map((cat) => (
                <label key={cat.id} className="flex items-center space-x-2">
                  <span className="text-sm text-gray-700">{cat.name}</span>
                  <input
                    type="checkbox"
                    checked={formData.categoryIds.includes(cat.id)}
                    onChange={() => {
                      const newCategoryIds = formData.categoryIds.includes(cat.id)
                        ? formData.categoryIds.filter((id) => id !== cat.id)
                        : [...formData.categoryIds, cat.id];
                      setFormData({ ...formData, categoryIds: newCategoryIds });
                    }}
                    className="rounded text-blue-600 focus:ring-blue-500"
                  />
                </label>
              ))}
            </div>
          </div>

          {/* جنس محصول */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">جنس محصول *</label>
            <select
              value={formData.material}
              onChange={(e) => setFormData({ ...formData, material: e.target.value })}
              className="w-full text-right p-2 border rounded focus:ring-2 focus:ring-blue-500"
            >
              <option value="">انتخاب کنید</option>
              {materials.map((mat) => (
                <option key={mat} value={mat}>
                  {mat}
                </option>
              ))}
            </select>
          </div>

          {/* رنگ محصول */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">رنگ محصول *</label>
            <select
              value={formData.color}
              onChange={(e) => setFormData({ ...formData, color: e.target.value })}
              className="w-full text-right p-2 border rounded focus:ring-2 focus:ring-blue-500"
            >
              <option value="">انتخاب کنید</option>
              {colors.map((color) => (
                <option key={color} value={color}>
                  {color}
                </option>
              ))}
            </select>
          </div>

          {/* قیمت و تخفیف */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">قیمت اصلی (تومان) *</label>
              <input
                type="number"
                value={formData.originalPrice}
                onChange={(e) => setFormData({ ...formData, originalPrice: e.target.value })}
                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 text-right"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">درصد تخفیف (اختیاری)</label>
              <input
                type="number"
                value={formData.discountPercent}
                onChange={(e) => setFormData({ ...formData, discountPercent: e.target.value })}
                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 text-right"
                min="0"
                max="100"
              />
            </div>
          </div>

          {/* ابعاد محصول */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">ابعاد محصول (سانتی‌متر)</label>
            <div className="grid grid-cols-3 gap-4">
              <input
                type="number"
                placeholder="طول"
                value={formData.dimensions.length}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    dimensions: { ...formData.dimensions, length: e.target.value },
                  })
                }
                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 text-right"
              />
              <input
                type="number"
                placeholder="عرض"
                value={formData.dimensions.width}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    dimensions: { ...formData.dimensions, width: e.target.value },
                  })
                }
                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 text-right"
              />
              <input
                type="number"
                placeholder="ارتفاع"
                value={formData.dimensions.height}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    dimensions: { ...formData.dimensions, height: e.target.value },
                  })
                }
                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 text-right"
              />
            </div>
          </div>

          {/* توضیحات */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">توضیحات محصول</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows="4"
              className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 text-right"
            />
          </div>

          {/* آپلود تصاویر */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">آپلود تصاویر محصول *</label>
            <div className="flex justify-end items-center gap-4">
              <label className="flex flex-col items-center justify-center w-32 h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-500">
                <svg
                  className="w-8 h-8 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                  />
                </svg>
                <span className="text-sm text-gray-500">افزودن تصویر</span>
                <input
                  type="file"
                  multiple
                  onChange={handleImageUpload}
                  className="hidden"
                  accept="image/*"
                />
              </label>
              <div className="flex gap-2">
                {previewImages.map((img, index) => (
                  <img
                    key={index}
                    src={img}
                    alt={`پیش نمایش ${index + 1}`}
                    className="w-32 h-32 object-cover rounded border"
                  />
                ))}
              </div>
            </div>
          </div>

          {/* دکمه ارسال */}
          <button
            type="submit"
            className="relative overflow-hidden rounded-2xl w-full min-h-16 bg-gradient-to-br from-purple-600 via-blue-600 to-cyan-500 text-white text-xl font-bold py-4 px-8 hover:shadow-2xl transition-all duration-500 group transform hover:-translate-y-1 active:translate-y-0 shadow-lg"
          >
            ایجاد محصول
          </button>
        </form>
      </div>
    </div>
  );
}