"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import Header from '../components/Header';
import ProductComments from '../components/comments/ProductComments';
import ProductCard from '../components/cards/ProductCard';

export default function ProductView() {
  const router = useRouter();
  const [product, setProduct] = useState(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [productComments, setProductComments] = useState([]);
  const [currentCommentIndex, setCurrentCommentIndex] = useState(0);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const productId = searchParams.get('id');
    if (productId) {
      // دریافت اطلاعات محصول
      fetch(`/api/products?id=${productId}`)
        .then((res) => {
          if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
          return res.json();
        })
        .then((data) => {
          if (!data.product) throw new Error("Product not found in API response");

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

      // دریافت کامنت‌ها
      fetch(`/api/comments/${productId}`)
        .then((res) => {
          if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
          return res.json();
        })
        .then((data) => {
          setProductComments(Array.isArray(data.comments) ? data.comments : []);
        })
        .catch((err) => {
          console.error("Error fetching comments:", err);
          setProductComments([]);
        });

      // دریافت محصولات مرتبط
      fetch('/api/products')
        .then(res => res.json())
        .then(data => {
          const allProducts = data.products || [];
          // فیلتر کردن محصولات مرتبط (حذف محصول فعلی و نمایش فقط محصولات موجود)
          const related = allProducts
            .filter(p => p.id !== parseInt(productId) && p.stock_quantity > 0)
            .slice(0, 10); // نمایش حداکثر 10 محصول
          setRelatedProducts(related);
        })
        .catch((err) => {
          console.error("Error fetching related products:", err);
          setRelatedProducts([]);
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
    if (!product?.images?.length) return;
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

  // اسکرول دستی برای اسلایدر محصولات
  const manualScroll = (direction) => {
    const container = document.getElementById('relatedProductsContainer');
    if (!container) return;
    const scrollAmount = direction === 'right' ? 300 : -300;
    container.scrollTo({
      left: container.scrollLeft + scrollAmount,
      behavior: 'smooth'
    });
  };

  if (!product) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <div className="text-center py-8 text-gray-600">در حال بارگذاری یا محصول پیدا نشد...</div>
      </div>
    );
  }

  const hasDiscount = product.discountPercent && Number(product.discountPercent) > 0;
  let originalPrice = product.price;
  if (hasDiscount) {
    originalPrice = Math.round(product.price / (1 - product.discountPercent / 100));
  }

  return (
    <div dir="rtl" className="pb-16 min-h-screen bg-white">
      <Header />

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
          style={{ boxShadow: '0 2px 8px #0001' }}
        >
          <ChevronLeft className="w-7 h-7" />
        </button>
      </div>

      <div className="max-w-7xl mx-auto p-4 md:p-8">
        <div className="flex flex-col md:flex-row gap-8">
          {/* گالری عکس‌ها */}
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
            {product.images?.length > 1 && (
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

          {/* اطلاعات و قیمت داخل یک کارت واحد */}
          <div className="md:w-2/3 space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
              <h1 className="text-2xl font-bold text-gray-900 mb-6">{product.name}</h1>

              <div className="space-y-3 divide-y divide-gray-100 text-sm">
                <div className="flex justify-between py-2">
                  <span className="text-gray-500">جنس:</span>
                  <span className="text-gray-900 font-medium">{product.material}</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-gray-500">رنگ:</span>
                  <span className="text-gray-900 font-medium">{product.color}</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-gray-500">موجودی:</span>
                  <span className={`font-medium ${product.stock_quantity > 0 ? "text-green-600" : "text-red-500"}`}>
                    {product.stock_quantity > 0 ? product.stock_quantity : 'ناموجود'}
                  </span>
                </div>
              </div>

              {/* قیمت و دکمه خرید */}
              <div className="mt-8 border-t pt-6 space-y-4">
                {hasDiscount && (
                  <div className="flex justify-between items-center">
                    <span className="text-red-500 text-sm font-medium bg-red-100 px-2 py-1 rounded">
                      ٪{product.discountPercent} تخفیف
                    </span>
                    <span className="line-through text-gray-400 text-sm">
                      {originalPrice.toLocaleString()} تومان
                    </span>
                  </div>
                )}
                <div className="text-2xl font-bold text-[#0F2C59] text-left">
                  {(product.price || 0).toLocaleString()} تومان
                </div>

                {product.stock_quantity > 0 ? (
                  <button
                    className="w-full bg-[#0F2C59] hover:bg-[#1A3D70] text-white py-3 rounded-xl transition-all shadow-lg"
                    onClick={addToCart}
                  >
                    افزودن به سبد خرید
                  </button>
                ) : (
                  <button
                    className="w-full bg-gray-400 text-white py-3 rounded-xl transition-all shadow-lg cursor-not-allowed"
                    disabled
                  >
                    ناموجود
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* توضیحات محصول */}
         <div className="mt-12">
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900 mb-6">توضیحات محصول</h2>
            <div className="text-gray-700 leading-relaxed">
              {product.information ? (
                <div className="whitespace-pre-line">
                  {product.information}
                </div>
              ) : (
                <p className="text-gray-500 italic">
                  هنوز توضیحاتی برای این محصول ثبت نشده است.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* مودال تصویر بزرگ */}
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

        {/* محصولات مرتبط */}
        {relatedProducts.length > 0 && (
          <div className="mt-12 bg-gray-100 rounded-xl p-6">
            <div className="relative group">
              <h2 className="text-2xl font-bold text-gray-800 mb-6 text-right">محصولات مرتبط</h2>
              
              {isMobile ? (
                // نمایش موبایل - اسکرول ساده
                <div className="flex overflow-x-auto gap-4 pb-4" style={{ scrollbarWidth: 'none' }}>
                  {relatedProducts.map(relatedProduct => (
                    <div key={relatedProduct.id} className="flex-shrink-0 w-64">
                      <ProductCard product={relatedProduct} />
                    </div>
                  ))}
                </div>
              ) : (
                // نمایش دسکتاپ - با دکمه‌های کنترل
                <>
                  <div
                    id="relatedProductsContainer"
                    className="flex overflow-x-auto gap-4 pb-4 scroll-smooth"
                    style={{ direction: 'rtl', scrollbarWidth: 'none' }}
                  >
                    {relatedProducts.map(relatedProduct => (
                      <div key={relatedProduct.id} className="flex-shrink-0 ml-4 w-72">
                        <ProductCard product={relatedProduct} />
                      </div>
                    ))}
                  </div>
                  
                  {/* دکمه‌های کنترل اسلایدر */}
                  <div className="absolute top-1/2 left-4 transform -translate-y-1/2 flex justify-between w-full px-4">
                    <button
                      onClick={() => manualScroll('right')}
                      className="bg-white/80 hover:bg-white backdrop-blur-sm transition-all duration-300 
                                text-gray-700 p-3 rounded-full shadow-lg hover:shadow-xl hover:scale-105
                                w-12 h-12 flex items-center justify-center border border-gray-100"
                    >
                      →
                    </button>
                    <button
                      onClick={() => manualScroll('left')}
                      className="bg-white/80 hover:bg-white backdrop-blur-sm transition-all duration-300 
                                text-gray-700 p-3 rounded-full shadow-lg hover:shadow-xl hover:scale-105
                                w-12 h-12 flex items-center justify-center border border-gray-100 mr-5"
                    >
                      ←
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}