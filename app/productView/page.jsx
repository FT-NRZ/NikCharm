"use client"
import { useState, useEffect } from 'react';
import { 
  Star, 
  Share2, 
  Heart, 
  X, 
  ChevronLeft, 
  ChevronRight 
} from 'lucide-react';
import productsData from '../data/products.json';
import commentsData from '../data/comments.json'; // Import comments data
import Header from '../components/Header';
import Navbar from '../components/Navbar';
import ProductComments from '../components/comments/ProductComments'; // Import ProductComments
export default function ProductView() {
  const [product, setProduct] = useState(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentCommentIndex, setCurrentCommentIndex] = useState(0); // Track the current comment index
  const [productComments, setProductComments] = useState([]);

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const productId = searchParams.get('id');

    if (productId) {
      const foundProduct = productsData.products.find((p) => p.id === parseInt(productId));
      setProduct(foundProduct);

      // Filter comments for the current product
      const filteredComments = commentsData.comments.filter(
        (comment) => comment.productId === parseInt(productId)
      );
      setProductComments(filteredComments);
    }
  }, []);

  // Automatically change the comment every 10 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentCommentIndex((prevIndex) => (prevIndex + 1) % productComments.length);
    }, 10000); // 10 seconds

    return () => clearInterval(interval); // Cleanup interval on component unmount
  }, [productComments]);

  const handleImageChange = (direction) => {
    if (direction === 'next') {
      setSelectedImage((prev) => (prev + 1) % product.images.length);
    } else {
      setSelectedImage((prev) => (prev - 1 + product.images.length) % product.images.length);
    }
  };

  if (!product) {
    return <div className="text-center py-8 text-gray-600">در حال بارگذاری...</div>;
  }

  return (
    <div dir="rtl" className='pb-16'>
      <Header />
      <Navbar />

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
              src={product.images[selectedImage]}
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

        <div className="max-w-7xl mx-auto p-4 md:p-8">
          <div className="flex flex-col md:flex-row gap-8">
            {/* بخش تصاویر با اندازه کوچکتر */}
            <div className="md:w-1/3">
              <div 
                className="relative group overflow-hidden rounded-2xl shadow-xl cursor-zoom-in"
                onClick={() => setIsModalOpen(true)}
                onMouseMove={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const x = ((e.clientX - rect.left) / rect.width) * 100;
                  const y = ((e.clientY - rect.top) / rect.height) * 100;
                  e.currentTarget.style.setProperty('--mouse-x', `${x}%`);
                  e.currentTarget.style.setProperty('--mouse-y', `${y}%`);
                }}
              >
                <img
                  src={product.images[selectedImage]}
                  alt={product.name}
                  className="w-full max-h-[400px] object-cover rounded-2xl transition-transform duration-300 group-hover:scale-150"
                  style={{
                    transformOrigin: 'var(--mouse-x, 50%) var(--mouse-y, 50%)', // تنظیم نقطه زوم بر اساس موس
                  }}
                />
              </div>

              {/* تصاویر کوچک */}
              <div className="flex gap-4 mt-6 overflow-x-auto pb-2">
                {product.images?.map((img, index) => (
                  <button
                    key={index}
                    className={`shrink-0 w-20 h-20 rounded-xl overflow-hidden border-2 transition-all duration-200 ${
                      selectedImage === index 
                        ? 'border-blue-500 scale-105' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setSelectedImage(index)}
                  >
                    <img
                      src={img}
                      alt={`تصویر ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* بخش اصلی اطلاعات */}
            <div className="md:w-2/3 flex flex-col md:flex-row gap-6">
              {/* بخش راست - اطلاعات محصول و ویژگی‌ها */}
              <div className="md:w-2/3 space-y-6">
                {/* اطلاعات اصلی */}
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
                  </div>
                </div>

                {/* ویژگی‌های محصول */}
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                  <h3 className="text-lg font-medium mb-4">ویژگی‌های محصول</h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-500">کد محصول:</span>
                      <span className="text-gray-900 font-medium">{product.productCode}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-500">ابعاد:</span>
                      <span className="text-gray-900 font-medium">
                        {product.dimensions.length} × {product.dimensions.width} × {product.dimensions.height} سانتیمتر
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* بخش چپ - قیمت و دکمه */}
              <div className="md:w-lg">
                <div className="bg-blue-50 p-6 rounded-2xl border-2 border-blue-100 shadow-sm ">
                  <div className="flex flex-col justify-between h-full gap-6">
                    {/* بخش قیمت */}
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-red-500 text-sm font-medium bg-red-50 px-2 py-1 rounded">
                          ٪{product.discountPercent || 0} تخفیف
                        </span>
                        <span className="line-through text-gray-400 text-sm">
                          {(product.originalPrice || 0).toLocaleString()} تومان
                        </span>
                      </div>
                      <div className="text-2xl font-bold text-blue-600">
                        {(product.price || 0).toLocaleString()} تومان
                      </div>
                    </div>

                    {/* دکمه خرید */}
                    <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl transition-all shadow-lg">
                      افزودن به سبد خرید
                    </button>
                  </div>
                </div>

                {/* دکمه‌های جانبی */}
                <div className="flex gap-3 mt-6">
                  <button className="flex-1 border border-gray-200 rounded-xl p-3 hover:bg-gray-50 transition-colors">
                    <Share2 className="w-6 h-6 mx-auto" />
                  </button>
                  <button 
                    className="flex-1 border border-gray-200 rounded-xl p-3 hover:bg-gray-50 transition-colors"
                    onClick={() => setIsLiked(!isLiked)}
                  >
                    <Heart
                      className="w-6 h-6 mx-auto"
                      strokeWidth={1.5}
                      fill={isLiked ? 'red' : 'none'}
                      stroke={isLiked ? 'red' : 'currentColor'}
                    />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* بخش ارسال نظر - منتقل شده به انتهای صفحه */}
          <div className="mt-12">
            <ProductComments productId={product.id} />
          </div>
        </div>
        </div>
  );
}