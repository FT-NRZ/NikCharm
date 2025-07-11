"use client";
import { useState, useEffect } from "react";
import { HiOutlineCheckCircle } from "react-icons/hi";
import { useRouter } from "next/navigation";

export default function CreateProduct() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    categoryId: "",
    material: "",
    color: "",
    originalPrice: "",
    discount: "",
    size: "",
    information: "",
    stock_quantity: "",
  });

  const [previewImages, setPreviewImages] = useState([]);
  const [imageUrls, setImageUrls] = useState([]); // آرایه url تصاویر
  const [showSuccess, setShowSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // دسته‌بندی‌ها و زیر دسته‌بندی‌ها
  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [selectedSubCategory, setSelectedSubCategory] = useState("");

  useEffect(() => {
    fetch("/api/categories")
      .then((res) => res.json())
      .then((data) => setCategories(data.categories || []));
  }, []);

  useEffect(() => {
    if (formData.categoryId) {
      const selectedCat = categories.find(
        (cat) => String(cat.id) === String(formData.categoryId)
      );
      setSubCategories(selectedCat?.subcategories || []);
      setSelectedSubCategory("");
    } else {
      setSubCategories([]);
      setSelectedSubCategory("");
    }
  }, [formData.categoryId, categories]);

  const materials = ["چرم طبیعی", "چرم مصنوعی", "پارچه", "دیگر مواد"];
  const colors = ["مشکی", "قهوه ای روشن", "قهوه ای تیره", "جیگری", "صورتی"];

  // آپلود چند تصویر
  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    for (const file of files) {
      const formDataUpload = new FormData();
      formDataUpload.append("file", file);

      try {
        const response = await fetch("/api/upload", {
          method: "POST",
          body: formDataUpload,
        });

        if (!response.ok) {
          throw new Error("خطا در آپلود تصویر");
        }

        const data = await response.json();

        setPreviewImages((prev) => [...prev, URL.createObjectURL(file)]);
        setImageUrls((prev) => [...prev, data.url]);
      } catch (error) {
        console.error("Upload error:", error);
        alert("خطا در آپلود تصویر");
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (
      !formData.name ||
      !formData.originalPrice ||
      !formData.categoryId ||
      imageUrls.length === 0 // حداقل یک تصویر باید باشد
    ) {
      alert("لطفا فیلدهای اجباری (*) را پر کنید");
      setIsSubmitting(false);
      return;
    }

    try {
      const originalPrice = parseFloat(formData.originalPrice);
      const discount = formData.discount ? parseFloat(formData.discount) : 0;
      const finalPrice = originalPrice - (originalPrice * (discount / 100));

      const response = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          price: finalPrice,
          categoryid: Number(formData.categoryId),
          subcategory_id: selectedSubCategory ? Number(selectedSubCategory) : null,
          discount: discount,
          color: formData.color || null,
          size: formData.size ? Number(formData.size) : null,
          material: formData.material || null,
          information: formData.information || "",
          images: imageUrls, // آرایه تصاویر
          stock_quantity: formData.stock_quantity ? Number(formData.stock_quantity) : 0,
        }),
      });

      if (response.ok) {
        setShowSuccess(true);
        setFormData({
          name: "",
          categoryId: "",
          material: "",
          color: "",
          originalPrice: "",
          discount: "",
          size: "",
          information: "",
          stock_quantity: "",
        });
        setPreviewImages([]);
        setImageUrls([]);
        setSelectedSubCategory("");
      } else {
        const errorData = await response.json();
        alert(`خطا: ${errorData.error || "خطا در ذخیره اطلاعات"}`);
      }
    } catch (error) {
      console.error("خطا:", error);
      alert("خطا در ارتباط با سرور");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCloseSuccess = () => {
    setShowSuccess(false);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 via-white to-cyan-50 py-10 px-2">
      {showSuccess && (
        <>
          <div className="fixed inset-0 bg-black/40 z-50"></div>
          <div className="fixed inset-0 flex items-center justify-center z-50">
            <div className="bg-green-100 border border-green-400 rounded-2xl shadow-2xl p-8 flex flex-col items-center max-w-xs w-full">
              <HiOutlineCheckCircle className="text-green-500 text-5xl mb-2" />
              <div className="text-green-700 font-bold text-lg mb-2">محصول با موفقیت ثبت شد!</div>
              <button
                onClick={handleCloseSuccess}
                className="mt-4 px-8 py-2 bg-green-500 text-white rounded-xl font-bold hover:bg-green-600 transition"
              >
                بازگشت به مدیریت
              </button>
            </div>
          </div>
        </>
      )}

      <div className={`max-w-4xl w-full md:border-1 text-right mt-4 p-8 bg-white rounded-3xl shadow-2xl border border-blue-100 relative overflow-hidden ${showSuccess ? "blur-sm pointer-events-none select-none" : ""}`}>
        <h1 className="text-3xl font-extrabold mb-8 text-blue-700 text-right drop-shadow z-10 relative">ایجاد محصول جدید</h1>

        <form onSubmit={handleSubmit} className="space-y-8 w-full z-10 relative">
          {/* نام محصول */}
          <div>
            <label className="block text-base font-bold text-gray-700 mb-2">نام محصول *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-blue-400 text-right bg-gray-50 transition"
              disabled={isSubmitting}
            />
          </div>

          {/* دسته‌بندی‌ها */}
          <div>
            <label className="block text-base font-bold text-gray-700 mb-2">دسته‌بندی *</label>
            <select
              value={formData.categoryId}
              onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
              className="w-full text-right p-3 border rounded-xl focus:ring-2 focus:ring-blue-400 bg-gray-50 transition"
              disabled={isSubmitting}
            >
              <option value="">انتخاب کنید</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* زیر دسته‌بندی */}
          {formData.categoryId && subCategories.length > 0 && (
            <div>
              <label className="block text-base font-bold text-gray-700 mb-2">زیر دسته‌بندی</label>
              <select
                value={selectedSubCategory}
                onChange={(e) => setSelectedSubCategory(e.target.value)}
                className="w-full text-right p-3 border rounded-xl focus:ring-2 focus:ring-blue-400 bg-gray-50 transition"
                disabled={isSubmitting}
              >
                <option value="">انتخاب کنید</option>
                {subCategories.map((sub) => (
                  <option key={sub.subcategory_id} value={sub.subcategory_id}>
                    {sub.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* جنس محصول */}
          <div>
            <label className="block text-base font-bold text-gray-700 mb-2">جنس محصول</label>
            <select
              value={formData.material}
              onChange={(e) => setFormData({ ...formData, material: e.target.value })}
              className="w-full text-right p-3 border rounded-xl focus:ring-2 focus:ring-blue-400 bg-gray-50 transition"
              disabled={isSubmitting}
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
            <label className="block text-base font-bold text-gray-700 mb-2">رنگ محصول</label>
            <select
              value={formData.color}
              onChange={(e) => setFormData({ ...formData, color: e.target.value })}
              className="w-full text-right p-3 border rounded-xl focus:ring-2 focus:ring-blue-400 bg-gray-50 transition"
              disabled={isSubmitting}
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <label className="block text-base font-bold text-gray-700 mb-2">قیمت اصلی (تومان) *</label>
              <input
                type="number"
                value={formData.originalPrice}
                onChange={(e) => setFormData({ ...formData, originalPrice: e.target.value })}
                className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-blue-400 text-right bg-gray-50 transition"
                disabled={isSubmitting}
                min="0"
                step="1000"
              />
            </div>
            <div>
              <label className="block text-base font-bold text-gray-700 mb-2">درصد تخفیف (اختیاری)</label>
              <input
                type="number"
                value={formData.discount}
                onChange={(e) => setFormData({ ...formData, discount: e.target.value })}
                className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-blue-400 text-right bg-gray-50 transition"
                disabled={isSubmitting}
                min="0"
                max="100"
              />
            </div>
          </div>

          {/* سایز (اختیاری) */}
          <div>
            <label className="block text-base font-bold text-gray-700 mb-2">سایز (اختیاری)</label>
            <input
              type="number"
              value={formData.size}
              onChange={(e) => setFormData({ ...formData, size: e.target.value })}
              className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-blue-400 text-right bg-gray-50 transition"
              disabled={isSubmitting}
            />
          </div>

          {/* توضیحات */}
          <div>
            <label className="block text-base font-bold text-gray-700 mb-2">توضیحات محصول</label>
            <textarea
              value={formData.information}
              onChange={(e) => setFormData({ ...formData, information: e.target.value })}
              rows="4"
              className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-blue-400 text-right bg-gray-50 transition"
              disabled={isSubmitting}
            />
          </div>

          {/* تعداد موجودی (اختیاری) */}
          <div>
            <label className="block text-base font-bold text-gray-700 mb-2">تعداد موجودی (اختیاری)</label>
            <input
              type="number"
              value={formData.stock_quantity}
              onChange={(e) => setFormData({ ...formData, stock_quantity: e.target.value })}
              className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-blue-400 text-right bg-gray-50 transition"
              disabled={isSubmitting}
              min="0"
            />
          </div>

          {/* آپلود تصاویر */}
          <div className="flex flex-col gap-4">
            <label className="block text-base font-bold text-gray-700 mb-2">آپلود تصاویر محصول *</label>
            <div className="flex items-center gap-4 flex-wrap">
              <label className={`flex flex-col items-center justify-center w-32 h-32 border-2 border-dashed rounded-xl cursor-pointer transition
                ${isSubmitting ? 'bg-gray-100 border-gray-300' : 'border-blue-300 bg-blue-50 hover:border-blue-500 hover:bg-blue-100'}`}>
                <svg
                  className="w-8 h-8 text-blue-400"
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
                <span className="text-sm text-blue-500">افزودن تصویر</span>
                <input
                  type="file"
                  multiple
                  onChange={handleImageUpload}
                  className="hidden"
                  accept="image/*"
                  disabled={isSubmitting}
                />
              </label>
              <div className="flex gap-2 flex-wrap">
                {previewImages.map((img, index) => (
                  <div key={index} className="relative">
                    <img
                      src={img}
                      alt={`پیش نمایش ${index + 1}`}
                      className="w-28 h-28 object-cover rounded-xl border border-blue-200 shadow"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* دکمه ارسال */}
          <button
            type="submit"
            disabled={isSubmitting}
            className={`relative overflow-hidden rounded-2xl w-full min-h-16 text-white text-2xl font-extrabold py-4 px-8 transition-all duration-500 group transform hover:-translate-y-1 active:translate-y-0 shadow-lg tracking-wide
              ${isSubmitting 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-gradient-to-br from-purple-600 via-blue-600 to-cyan-500 hover:shadow-2xl'}`}
          >
            <span className="relative z-10">
              {isSubmitting ? 'در حال ذخیره...' : 'ایجاد محصول'}
            </span>
            {!isSubmitting && (
              <span className="absolute left-0 top-0 w-0 h-full bg-white/20 group-hover:w-full transition-all duration-500 rounded-2xl"></span>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}