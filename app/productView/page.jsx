"use client"
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import Header from '../components/Header';
import ProductComments from '../components/comments/ProductComments';

export default function ProductView() {
  const router = useRouter();
  const [product, setProduct] = useState(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [productComments, setProductComments] = useState([]);
  const [currentCommentIndex, setCurrentCommentIndex] = useState(0);

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const productId = searchParams.get('id');
    if (productId) {
      fetch(`/api/products?id=${productId}`)
        .then((res) => {
          if (!res.ok) {
            throw new Error(`HTTP error! status: ${res.status}`);
          }
          return res.json();
        })
        .then((data) => {
          if (!data.product) {
            throw new Error("Product not found in API response");
          }
          // استخراج آدرس عکس‌ها از product_images
          let images = [];
          if (Array.isArray(data.product.product_images) && data.product.product_images.length > 0) {
            images = data.product.product_images.map(img => img.url);
          } else if (data.product.image_url) {
            images = [data.product.image_url];
          }
          setProduct({ ...data.product, images });
        })
        .catch((err) => {
          console.error("Error fetching product:", err);
          setProduct(null);
        });

      fetch(`/api/comments/${productId}`)
        .then((res) => {
          if (!res.ok) {
            throw new Error(`HTTP error! status: ${res.status}`);
          }
          return res.json();
        })
        .then((data) => {
          // اطمینان از اینکه کامنت‌ها آرایه است
          setProductComments(Array.isArray(data.comments) ? data.comments : []);
        })
        .catch((err) => {
          console.error("Error fetching comments:", err);
          setProductComments([]); // اگر خطا شد، آرایه خالی بده
        });
    }
  }, []);

  useEffect(() => {
    if (productComments.length === 0) return;
    const interval = setInterval(() => {
      setCurrentCommentIndex(prevIndex => (prevIndex + 1) % productComments.length);
    }, 10000);
    return () => clearInterval(interval);
  }, [productComments]);

  const handleImageChange = (direction) => {
    if (!product || !product.images || product.images.length === 0) return;
    if (direction === 'next') {
      setSelectedImage(prev => (prev + 1) % product.images.length);
    } else {
      setSelectedImage(prev => (prev - 1 + product.images.length) % product.images.length);
    }
  };

  const addToCart = () => {
    if (!product) return;
    let cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const exists = cart.find(item => Number(item.id) === Number(product.id));
    if (exists) {
      cart = cart.map(item =>
        Number(item.id) === Number(product.id)
          ? { ...item, quantity: item.quantity + 1 }
          : item
      );
    } else {
      cart.push({ id: product.id, quantity: 1 });
    }
    localStorage.setItem('cart', JSON.stringify(cart));
    router.push('/cart');
  };

  if (!product) {
    return <div className="text-center py-8 text-gray-600">در حال بارگذاری یا محصول پیدا نشد...</div>;
  }

  // محاسبه قیمت قبلی و درصد تخفیف
  const hasDiscount = product.discountPercent && Number(product.discountPercent) > 0;
  let originalPrice = product.price;
  if (hasDiscount) {
    originalPrice = Math.round(product.price / (1 - product.discountPercent / 100));
  }

  return (
    <div dir="rtl" className="pb-16">
      <div>
        <Header />
      </div>

      <div className="relative">
        <button
          onClick={() => {
            if (window.history.length > 1) {
              router.back();
            } else {
              router.push('/');
            }
          }}
          className="absolute top-2 left-2 z-40 bg-gray-100 hover:bg-gray-200 text-gray-400 rounded-full p-2 transition-colors"
          aria-label="بازگشت"
          style={{ boxShadow: '0 2px 8px #0001' }}
        >
          <ChevronLeft className="w-7 h-7" />
        </button>
      </div>

      {/* نمایش عکس محصول و گالری */}
      <div className="max-w-7xl mx-auto p-4 md:p-8">
        <div className="flex flex-col md:flex-row gap-8">
          <div className="md:w-1/3 flex flex-col items-center">
            <div
              className="w-full aspect-square bg-gray-100 rounded-2xl overflow-hidden cursor-pointer flex items-center justify-center"
              onClick={() => setIsModalOpen(true)}
            >
              <img
                src={product.images?.[selectedImage] || '/leather-placeholder.jpg'}
                alt={product.name}
                className="w-full h-full object-contain"
              />
            </div>
            {/* نمایش تصاویر کوچک اگر بیش از یک عکس وجود دارد */}
            {product.images && product.images.length > 1 && (
              <div className="flex gap-2 mt-4">
                {product.images.map((img, idx) => (
                  <img
                    key={idx}
                    src={img}
                    alt={product.name + '-' + idx}
                    className={`w-16 h-16 object-cover rounded-lg border-2 cursor-pointer ${selectedImage === idx ? 'border-blue-500' : 'border-transparent'}`}
                    onClick={() => setSelectedImage(idx)}
                  />
                ))}
              </div>
            )}
          </div>

          {/* سایر بخش‌های صفحه */}
          <div className="md:w-2/3 flex flex-col md:flex-row gap-6">
            {/* بخش سمت راست - اطلاعات محصول */}
            <div className="md:w-2/3 space-y-6">
              <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                <h1 className="text-2xl font-bold text-gray-900 mb-4">{product.name}</h1>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500">جنس:</span>
                    <span className="text-gray-900 font-medium">{product.material}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500">رنگ:</span>
                    <span className="text-gray-900 font-medium">{product.color}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500">موجودی:</span>
                    <span className="text-gray-900 font-medium">
                      {product.stock_quantity > 0 ? product.stock_quantity : 'ناموجود'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* بخش سمت چپ - قیمت و خرید */}
            <div className="md:w-lg">
              <div className="bg-blue-50 p-6 rounded-2xl border-2 border-blue-100 shadow-sm">
                <div className="flex flex-col justify-between h-full gap-6">
                  <div className="space-y-4">
                    {hasDiscount && (
                      <div className="flex justify-between items-center">
                        <span className="text-red-500 text-sm font-medium bg-red-50 px-2 py-1 rounded">
                          ٪{product.discountPercent} تخفیف
                        </span>
                        <span className="line-through text-gray-400 text-sm">
                          {originalPrice.toLocaleString()} تومان
                        </span>
                      </div>
                    )}
                    <div className="text-2xl font-bold text-blue-600">
                      {(product.price || 0).toLocaleString()} تومان
                    </div>
                  </div>

                  {product.stock_quantity > 0 ? (
                    <button
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl transition-all shadow-lg"
                      onClick={addToCart}
                    >
                      افزودن به سبد خرید
                    </button>
                  ) : (
                    <button className="w-full bg-gray-400 text-white py-3 rounded-xl transition-all shadow-lg cursor-not-allowed" disabled>
                      ناموجود
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* مودال نمایش بزرگ عکس */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center">
            <button
              className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors z-50"
              onClick={() => setIsModalOpen(false)}
            >
              <X className="w-8 h-8" />
            </button>
            <div className="relative w-full h-full flex items-center justify-center">
              <button
                className="absolute left-4 text-white hover:text-gray-300 p-2 z-50"
                onClick={() => handleImageChange('prev')}
              >
                <ChevronLeft className="w-8 h-8" />
              </button>
              <img
                src={product.images?.[selectedImage] || '/leather-placeholder.jpg'}
                alt={product.name}
                className="max-w-[90%] max-h-[90%] object-contain cursor-zoom-out"
                onClick={() => setIsModalOpen(false)}
              />
              <button
                className="absolute right-4 text-white hover:text-gray-300 p-2 z-50"
                onClick={() => handleImageChange('next')}
              >
                <ChevronRight className="w-8 h-8" />
              </button>
            </div>
          </div>
        )}

        {/* نظرات محصول */}
        <div className="mt-12">
          <ProductComments productId={product.id} comments={productComments} />
        </div>
      </div>
    </div>
  );
}