"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function EditSlider() {
  const router = useRouter();
  const [sliderImages, setSliderImages] = useState([]);
  const [newFile, setNewFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [orderChanges, setOrderChanges] = useState({});

  // دریافت لیست عکس‌های اسلایدر از API
  useEffect(() => {
    fetch("/api/slider")
      .then((res) => res.json())
      .then((data) => {
        setSliderImages(data.sliderImages || []);
      });
  }, []);

  // مدیریت تغییر فایل برای آپلود
  const handleFileChange = (e) => {
    setNewFile(e.target.files[0]);
  };

  // آپلود عکس جدید
  const handleUpload = async () => {
    if (!newFile) return;
    setUploading(true);
    try {
      // ابتدا فایل را به API /api/upload ارسال کن تا URL عکس دریافت شود
      const formData = new FormData();
      formData.append("file", newFile);

      const resUpload = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const uploadData = await resUpload.json();
      const imageUrl = uploadData.url;
      
      // سپس عکس را به اسلایدر اضافه کن
      const resAdd = await fetch("/api/slider", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageUrl }),
      });
      if (resAdd.ok) {
        // لیست عکس‌ها را به‌روز کن
        const res = await fetch("/api/slider");
        const data = await res.json();
        setSliderImages(data.sliderImages || []);
        setNewFile(null);
      }
    } catch (error) {
      console.error("خطا در آپلود:", error);
    } finally {
      setUploading(false);
    }
  };

  // حذف عکس از اسلایدر
  const handleDelete = async (id) => {
    const confirmDelete = confirm("آیا مطمئن هستید که می‌خواهید این عکس را حذف کنید؟");
    if (!confirmDelete) return;

    try {
      const res = await fetch(`/api/slider?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        setSliderImages(sliderImages.filter((img) => img.id !== id));
      }
    } catch (error) {
      console.error("خطا در حذف عکس:", error);
    }
  };

  // تغییر ترتیب به صورت دستی
  const handleOrderChange = (id, newOrder) => {
    setOrderChanges((prev) => ({ ...prev, [id]: newOrder }));
    setSliderImages((prev) =>
      prev.map((img) => (img.id === id ? { ...img, order: newOrder } : img))
    );
  };

  // ذخیره ترتیب جدید عکس‌ها
  const handleSaveOrder = async () => {
    try {
      const res = await fetch("/api/slider/reorder", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderChanges),
      });
      if (res.ok) {
        const updated = await fetch("/api/slider");
        const data = await updated.json();
        setSliderImages(data.sliderImages || []);
        setOrderChanges({});
      }
    } catch (error) {
      console.error("خطا در ذخیره ترتیب:", error);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6 text-center">ویرایش اسلایدر صفحه خانه</h1>

      {/* بخش آپلود عکس جدید */}
      <div className="border p-6 rounded-lg shadow-lg mb-8 bg-white">
        <h2 className="text-2xl font-semibold mb-4">افزودن عکس جدید</h2>
        <div className="flex items-center gap-4">
          <input 
            type="file" 
            onChange={handleFileChange} 
            className="border p-2 rounded"
          />
          <button
            onClick={handleUpload}
            disabled={uploading || !newFile}
            className="px-5 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
          >
            {uploading ? "در حال آپلود..." : "آپلود فایل"}
          </button>
        </div>
      </div>

      {/* لیست عکس‌های موجود در اسلایدر */}
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <h2 className="text-2xl font-semibold mb-4">عکس‌های موجود</h2>
        {sliderImages.length === 0 ? (
          <p className="text-gray-500">هیچ عکسی موجود نیست.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {sliderImages.map((img) => (
              <div key={img.id} className="border p-4 rounded-lg flex items-center gap-4">
                <img
                  src={img.imageUrl}
                  alt="Slider"
                  className="w-24 h-24 object-cover rounded"
                />
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700">
                    ترتیب:
                  </label>
                  <input
                    type="number"
                    value={img.order || ""}
                    onChange={(e) =>
                      handleOrderChange(img.id, Number(e.target.value))
                    }
                    className="mt-1 border rounded w-20 p-1"
                  />
                </div>
                <button
                  onClick={() => handleDelete(img.id)}
                  className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
                >
                  حذف
                </button>
              </div>
            ))}
          </div>
        )}
        {Object.keys(orderChanges).length > 0 && (
          <button
            onClick={handleSaveOrder}
            className="mt-6 px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
          >
            ذخیره ترتیب
          </button>
        )}
      </div>
    </div>
  );
}