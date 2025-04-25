'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import productsData from '../../../../app/data/products.json';

export default function ProductEditForm() {
  const { id } = useParams();
  const router = useRouter();
  const [product, setProduct] = useState(null);
  const [name, setName] = useState('');
  const [categoryIds, setCategoryIds] = useState([]); // دسته‌بندی‌های انتخاب‌شده
  const [material, setMaterial] = useState('');
  const [color, setColor] = useState('');
  const [price, setPrice] = useState('');
  const [images, setImages] = useState([]);
  const [mainImage, setMainImage] = useState('');

  const categories = [
    { id: 1, name: 'زنانه' },
    { id: 2, name: 'مردانه' },
    { id: 3, name: 'اکسسوری' },
  ]; // دسته‌بندی‌های نمونه

  useEffect(() => {
    const foundProduct = productsData.products.find((p) => p.id === parseInt(id));
    if (foundProduct) {
      setProduct(foundProduct);
      setName(foundProduct.name);
      setCategoryIds(foundProduct.categoryIds || []); // دسته‌بندی‌های فعلی
      setMaterial(foundProduct.material);
      setColor(foundProduct.color);
      setPrice(foundProduct.price);
      setImages(foundProduct.images || []);
      setMainImage(foundProduct.images[0] || '');
    }
  }, [id]);

  const handleCategoryChange = (categoryId) => {
    if (categoryIds.includes(categoryId)) {
      setCategoryIds(categoryIds.filter((id) => id !== categoryId)); // حذف دسته‌بندی
    } else {
      setCategoryIds([...categoryIds, categoryId]); // اضافه کردن دسته‌بندی
    }
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    const newImages = files.map((file) => URL.createObjectURL(file));
    setImages([...images, ...newImages]);
  };

  const handleRemoveImage = (image) => {
    setImages(images.filter((img) => img !== image));
    if (mainImage === image) {
      setMainImage(images[0] || '');
    }
  };

  const handleSetMainImage = (image) => {
    setMainImage(image);
  };

  const handleUpdate = async () => {
    const updatedProduct = {
      name,
      categoryIds,
      material,
      color,
      price,
      images,
      mainImage,
    };

    try {
      const response = await fetch('/api/updateProduct', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id, updatedProduct }),
      });

      if (response.ok) {
        router.push('/admin/EditProduct');
      } else {
        console.error('Error updating product');
      }
    } catch (error) {
      console.error('Error sending request:', error);
    }
  };

  const handleCancel = () => {
    router.push('/admin/EditProduct');
  };

  if (!product) {
    return <div className="text-center text-gray-500">در حال بارگذاری...</div>;
  }

  return (
    <div className="container mx-auto mt-8 p-6 bg-gray-50 rounded-lg shadow-lg rtl text-right">
      <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">ویرایش محصول</h1>
      <form className="space-y-6">
        {/* Product Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">نام محصول</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-right"
            placeholder="نام محصول"
          />
        </div>

        {/* Categories */}
        <div dir='rtl'>
          <label className="block text-sm font-medium text-gray-700 mb-2">دسته‌بندی‌ها</label>
          <div className="flex flex-wrap gap-3">
            {categories.map((cat) => (
              <label key={cat.id} className="flex mt-2 items-center space-x-2">
                <input
                  type="checkbox"
                  checked={categoryIds.includes(cat.id)}
                  onChange={() => handleCategoryChange(cat.id)}
                  className="rounded text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">{cat.name}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Material */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">جنس</label>
          <input
            type="text"
            value={material}
            onChange={(e) => setMaterial(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-right"
            placeholder="جنس"
          />
        </div>

        {/* Color */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">رنگ</label>
          <input
            type="text"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-right"
            placeholder="رنگ"
          />
        </div>

        {/* Price */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">قیمت</label>
          <input
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-right"
            placeholder="قیمت"
          />
        </div>

        {/* Images */}
        <div dir='rtl'>
          <label className="block text-sm font-medium text-gray-700 mb-2">تصاویر محصول</label>
          <div className="flex flex-wrap gap-4">
            {images.map((image, index) => (
              <div key={index} className="relative group">
                <img
                  src={image}
                  alt={`تصویر ${index + 1}`}
                  className={`w-32 h-32 object-cover rounded-lg border ${
                    mainImage === image ? 'border-blue-500' : 'border-gray-300'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => handleSetMainImage(image)}
                  className={`absolute bottom-2 left-2 text-xs px-2 py-1 rounded ${
                    mainImage === image ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-800'
                  }`}
                >
                  {mainImage === image ? 'تصویر اصلی' : 'انتخاب'}
                </button>
                <button
                  type="button"
                  onClick={() => handleRemoveImage(image)}
                  className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  حذف
                </button>
              </div>
            ))}
          </div>
          <label className="block mt-4">
            <span className="text-sm text-gray-500">افزودن تصویر جدید</span>
            <input
              type="file"
              multiple
              onChange={handleImageUpload}
              className="mt-2 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
          </label>
        </div>

        {/* Buttons */}
        <div className="flex justify-between">
          <button
            type="button"
            onClick={handleCancel}
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