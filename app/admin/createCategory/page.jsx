"use client";
import { useState, useEffect } from "react";
import { HiOutlineCheckCircle } from "react-icons/hi";

export default function CreateCategory() {
  const [formData, setFormData] = useState({
    name: "",
    type: "",
  });
  const [showSuccess, setShowSuccess] = useState(false);
  const [categories, setCategories] = useState([]);
  const [subForm, setSubForm] = useState({ category_id: "", name: "" });
  const [showSubSuccess, setShowSubSuccess] = useState(false);

  // گرفتن دسته‌بندی‌ها برای انتخاب والد زیر دسته‌بندی
  useEffect(() => {
    fetch("/api/categories")
      .then((res) => res.json())
      .then((data) => setCategories(data.categories || []));
  }, [showSuccess, showSubSuccess]);

  // ایجاد دسته‌بندی جدید
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name) {
      alert("نام دسته‌بندی الزامی است");
      return;
    }
    try {
      const res = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          type: formData.type || "other",
        }),
      });
      if (res.ok) {
        setShowSuccess(true);
        setFormData({ name: "", type: "" });
      }
    } catch (err) {
      alert("خطا در ایجاد دسته‌بندی");
    }
  };

  // ایجاد زیر دسته‌بندی جدید
  const handleSubSubmit = async (e) => {
    e.preventDefault();
    if (!subForm.name || !subForm.category_id) {
      alert("نام زیر دسته و انتخاب دسته‌بندی والد الزامی است");
      return;
    }
    try {
      const res = await fetch("/api/subcategories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: subForm.name,
          category_id: Number(subForm.category_id),
        }),
      });
      if (res.ok) {
        setShowSubSuccess(true);
        setSubForm({ category_id: "", name: "" });
      }
    } catch (err) {
      alert("خطا در ایجاد زیر دسته‌بندی");
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 via-white to-cyan-50 py-10 px-2">
      {/* باکس موفقیت دسته‌بندی */}
      {showSuccess && (
        <>
          <div className="fixed inset-0 bg-black/40 z-50"></div>
          <div className="fixed inset-0 flex items-center justify-center z-50">
            <div className="bg-green-100 border border-green-400 rounded-2xl shadow-2xl p-8 flex flex-col items-center max-w-xs w-full">
              <HiOutlineCheckCircle className="text-green-500 text-5xl mb-2" />
              <div className="text-green-700 font-bold text-lg mb-2">دسته‌بندی با موفقیت ایجاد شد!</div>
              <button
                onClick={() => setShowSuccess(false)}
                className="mt-4 px-8 py-2 bg-green-500 text-white rounded-xl font-bold hover:bg-green-600 transition"
              >
                باشه
              </button>
            </div>
          </div>
        </>
      )}

      {/* باکس موفقیت زیر دسته‌بندی */}
      {showSubSuccess && (
        <>
          <div className="fixed inset-0 bg-black/40 z-50"></div>
          <div className="fixed inset-0 flex items-center justify-center z-50">
            <div className="bg-green-100 border border-green-400 rounded-2xl shadow-2xl p-8 flex flex-col items-center max-w-xs w-full">
              <HiOutlineCheckCircle className="text-green-500 text-5xl mb-2" />
              <div className="text-green-700 font-bold text-lg mb-2">زیر دسته‌بندی با موفقیت ایجاد شد!</div>
              <button
                onClick={() => setShowSubSuccess(false)}
                className="mt-4 px-8 py-2 bg-green-500 text-white rounded-xl font-bold hover:bg-green-600 transition"
              >
                باشه
              </button>
            </div>
          </div>
        </>
      )}

      <div className={`max-w-2xl w-full text-right mt-4 p-8 bg-white rounded-3xl shadow-2xl border border-blue-100 relative overflow-hidden ${showSuccess || showSubSuccess ? "blur-sm pointer-events-none select-none" : ""}`}>
        <h1 className="text-3xl font-extrabold mb-8 text-blue-700 text-right drop-shadow z-10 relative">ایجاد دسته‌بندی جدید</h1>
        <form onSubmit={handleSubmit} className="space-y-8 w-full z-10 relative">
          <div>
            <label className="block text-base font-bold text-gray-700 mb-2">نام دسته‌بندی *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-blue-400 text-right bg-gray-50 transition"
            />
          </div>
          <div>
            <label className="block text-base font-bold text-gray-700 mb-2">نوع دسته‌بندی (اختیاری)</label>
            <input
              type="text"
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-blue-400 text-right bg-gray-50 transition"
              placeholder="مثلاً کیف، کفش، لباس و ..."
            />
          </div>
          <button
            type="submit"
            className="relative overflow-hidden rounded-2xl w-full min-h-16 bg-gradient-to-br from-purple-600 via-blue-600 to-cyan-500 text-white text-2xl font-extrabold py-4 px-8 hover:shadow-2xl transition-all duration-500 group transform hover:-translate-y-1 active:translate-y-0 shadow-lg tracking-wide"
          >
            <span className="relative z-10">ایجاد دسته‌بندی</span>
            <span className="absolute left-0 top-0 w-0 h-full bg-white/20 group-hover:w-full transition-all duration-500 rounded-2xl"></span>
          </button>
        </form>
      </div>

      {/* فرم ایجاد زیر دسته‌بندی */}
      <div className={`max-w-2xl w-full text-right mt-10 p-8 bg-white rounded-3xl shadow-2xl border border-blue-100 relative overflow-hidden ${showSuccess || showSubSuccess ? "blur-sm pointer-events-none select-none" : ""}`}>
        <h2 className="text-2xl font-bold mb-6 text-blue-700">ایجاد زیر دسته‌بندی جدید</h2>
        <form onSubmit={handleSubSubmit} className="space-y-8 w-full z-10 relative">
          <div>
            <label className="block text-base font-bold text-gray-700 mb-2">انتخاب دسته‌بندی والد *</label>
            <select
              value={subForm.category_id}
              onChange={(e) => setSubForm({ ...subForm, category_id: e.target.value })}
              className="w-full text-right p-3 border rounded-xl focus:ring-2 focus:ring-blue-400 bg-gray-50 transition"
            >
              <option value="">انتخاب کنید</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-base font-bold text-gray-700 mb-2">نام زیر دسته‌بندی *</label>
            <input
              type="text"
              value={subForm.name}
              onChange={(e) => setSubForm({ ...subForm, name: e.target.value })}
              className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-blue-400 text-right bg-gray-50 transition"
            />
          </div>
          <button
            type="submit"
            className="relative overflow-hidden rounded-2xl w-full min-h-16 bg-gradient-to-br from-blue-600 via-cyan-500 to-purple-600 text-white text-2xl font-extrabold py-4 px-8 hover:shadow-2xl transition-all duration-500 group transform hover:-translate-y-1 active:translate-y-0 shadow-lg tracking-wide"
          >
            <span className="relative z-10">ایجاد زیر دسته‌بندی</span>
            <span className="absolute left-0 top-0 w-0 h-full bg-white/20 group-hover:w-full transition-all duration-500 rounded-2xl"></span>
          </button>
        </form>
      </div>
    </div>
  );
}