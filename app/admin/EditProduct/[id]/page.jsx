'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';

const materials = ["چرم طبیعی", "چرم مصنوعی", "پارچه", "دیگر مواد"];
const colors = ["مشکی", "قهوه ای روشن", "قهوه ای تیره", "جیگری", "صورتی"];


export default function EditProductPage() {
  const { id } = useParams();
  const router = useRouter();
  const [product, setProduct] = useState(null);
  const [categories, setCategories] = useState([]);
  const [name, setName] = useState('');
  const [categoryid, setCategoryid] = useState('');
  const [material, setMaterial] = useState('');
  const [color, setColor] = useState('');
  const [price, setPrice] = useState('');
  const [stock_quantity, setStockQuantity] = useState(0);
  const [images, setImages] = useState([]);
  const [newImageFiles, setNewImageFiles] = useState([]);
  const [previewImages, setPreviewImages] = useState([]);

  // گرفتن اطلاعات محصول و دسته‌بندی‌ها
  useEffect(() => {
    fetch(`/api/products?id=${id}`)
      .then(res => res.json())
      .then(data => {
        const prod = data.product || {};
        setProduct(prod);
        setName(prod.name || '');
        setCategoryid(prod.categoryid ? String(prod.categoryid) : '');
        setMaterial(prod.material || '');
        setColor(prod.color || '');
        setPrice(prod.price || '');
        setStockQuantity(prod.stock_quantity ?? 0);
        setImages(prod.product_images || []);
      });
    fetch('/api/categories')
      .then(res => res.json())
      .then(data => setCategories(data.categories || []));
  }, [id]);

  // حذف تصویر قبلی از UI (حذف واقعی باید در API هندل شود)
  const handleRemoveImage = (imgId) => {
    setImages(images.filter(img => img.id !== imgId));
  };

  // حذف عکس جدید قبل از ذخیره
  const handleRemovePreviewImage = (idx) => {
    setPreviewImages(previewImages.filter((_, i) => i !== idx));
    setNewImageFiles(newImageFiles.filter((_, i) => i !== idx));
  };

  // آپلود تصاویر جدید
  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    setNewImageFiles(files);
    setPreviewImages(files.map(file => URL.createObjectURL(file)));
  };

  // ذخیره تغییرات
  const handleUpdate = async () => {
    // آپلود تصاویر جدید
    let newImageUrls = [];
    for (const file of newImageFiles) {
      const formDataUpload = new FormData();
      formDataUpload.append("file", file);
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formDataUpload,
      });
      if (!response.ok) {
        alert("خطا در آپلود تصویر جدید");
        return;
      }
      const data = await response.json();
      newImageUrls.push(data.url);
    }

    // آرایه نهایی تصاویر (تصاویر قبلی که حذف نشده‌اند + تصاویر جدید)
    const finalImages = [
      ...images.map(img => img.url),
      ...newImageUrls
    ];

    const updatedProduct = {
      id: Number(id),
      name,
      categoryid: Number(categoryid),
      material,
      color,
      price: Number(price),
      stock_quantity: Number(stock_quantity),
      images: finalImages,
    };

    const response = await fetch('/api/products', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedProduct),
    });

    if (response.ok) {
      router.push('/admin/EditProduct');
    } else {
      alert('خطا در ویرایش محصول');
    }
  };

  if (!product) {
    return <div className="text-center text-gray-500">در حال بارگذاری...</div>;
  }

  return (
    <div className="container mx-auto mt-8 p-6 bg-gray-50 rounded-lg shadow-lg rtl text-right">
      <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">ویرایش محصول</h1>
      <form className="space-y-6" onSubmit={e => e.preventDefault()}>
        {/* نام محصول */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">نام محصول</label>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-right"
            placeholder="نام محصول"
          />
        </div>
        {/* دسته‌بندی */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">دسته‌بندی</label>
          <select
            value={categoryid}
            onChange={e => setCategoryid(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-right"
          >
            <option value="">انتخاب دسته‌بندی</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>
        {/* جنس */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">جنس محصول</label>
          <select
            value={material}
            onChange={e => setMaterial(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-right"
          >
            <option value="">انتخاب کنید</option>
            {materials.map(mat => (
              <option key={mat} value={mat}>{mat}</option>
            ))}
          </select>
        </div>

        {/* رنگ */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">رنگ محصول</label>
          <select
            value={color}
            onChange={e => setColor(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-right"
          >
            <option value="">انتخاب کنید</option>
            {colors.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
        {/* قیمت */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">قیمت</label>
          <input
            type="number"
            value={price}
            onChange={e => setPrice(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-right"
            placeholder="قیمت"
          />
        </div>
        {/* موجودی */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">موجودی</label>
          <input
            type="number"
            value={stock_quantity}
            onChange={e => setStockQuantity(e.target.value)}
            min={0}
            step={1}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-right"
            placeholder="موجودی"
          />
        </div>
        {/* تصاویر */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">تصاویر محصول</label>
          <div className="flex flex-wrap gap-3 mb-2">
            {/* تصاویر قبلی */}
            {images.map(img => (
              <div key={img.id} className="relative">
                <img
                  src={img.url}
                  alt="تصویر محصول"
                  className="w-24 h-24 object-cover rounded-lg border border-gray-300"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveImage(img.id)}
                  className="absolute top-0 left-0 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs"
                  title="حذف تصویر"
                >×</button>
              </div>
            ))}
            {/* تصاویر جدید (پیش‌نمایش) */}
            {previewImages.map((img, idx) => (
              <div key={idx} className="relative">
                <img
                  src={img}
                  alt="تصویر جدید"
                  className="w-24 h-24 object-cover rounded-lg border border-blue-300"
                />
                <button
                  type="button"
                  onClick={() => handleRemovePreviewImage(idx)}
                  className="absolute top-0 left-0 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs"
                  title="حذف تصویر"
                >×</button>
              </div>
            ))}
          </div>
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleImageUpload}
            className="block mt-2"
          />
        </div>
        {/* دکمه‌ها */}
        <div className="flex justify-between">
          <button
            type="button"
            onClick={() => router.push('/admin/EditProduct')}
            className="w-1/2 m-2 bg-red-500 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            لغو
          </button>
          <button
            type="button"
            onClick={handleUpdate}
            className="w-1/2 m-2 bg-blue-500 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            ذخیره تغییرات
          </button>
        </div>
      </form>
    </div>
  );
}