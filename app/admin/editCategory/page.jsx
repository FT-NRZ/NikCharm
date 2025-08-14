'use client';
import { useState, useEffect } from 'react';
import { HiOutlinePencilAlt, HiOutlineTag, HiOutlinePlus, HiX, HiCheck } from "react-icons/hi";
import { motion, AnimatePresence } from 'framer-motion';

export default function EditCategoryPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editModal, setEditModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [editForm, setEditForm] = useState({ name: '' });
  const [expandedCategories, setExpandedCategories] = useState(new Set());
  const [isSubcategory, setIsSubcategory] = useState(false);

  // گرفتن دسته‌بندی‌ها از دیتابیس
  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories');
      const data = await response.json();
      console.log('Data from API:', data); // برای دیباگ
      setCategories(data.categories || []);
    } catch (error) {
      console.error('خطا در دریافت دسته‌بندی‌ها:', error);
    } finally {
      setLoading(false);
    }
  };
  // ویرایش دسته‌بندی اصلی
  const handleEditCategory = async () => {
    try {
      console.log('Editing category:', selectedCategory.id, 'New name:', editForm.name);
      
      const response = await fetch(`/api/categories`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          id: selectedCategory.id,
          name: editForm.name 
        }),
      });

      console.log('Response status:', response.status);
      const responseData = await response.json();
      console.log('Response data:', responseData);

      if (response.ok) {
        await fetchCategories();
        setEditModal(false);
        setSelectedCategory(null);
        setEditForm({ name: '' });
        alert('دسته‌بندی با موفقیت ویرایش شد!');
      } else {
        console.error('API Error:', responseData);
        alert(`خطا در ویرایش دسته‌بندی: ${responseData.error || response.statusText}`);
      }
    } catch (error) {
      console.error('خطا در ویرایش:', error);
      alert(`خطا در ویرایش دسته‌بندی: ${error.message}`);
    }
  };

  // ویرایش زیردسته‌بندی
  const handleEditSubcategory = async () => {
    try {
      console.log('Editing subcategory:', selectedCategory.id, 'New name:', editForm.name);
      
      const response = await fetch(`/api/subcategories`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          id: selectedCategory.id,
          name: editForm.name 
        }),
      });

      console.log('Response status:', response.status);
      const responseData = await response.json();
      console.log('Response data:', responseData);

      if (response.ok) {
        await fetchCategories();
        setEditModal(false);
        setSelectedCategory(null);
        setEditForm({ name: '' });
        alert('زیردسته‌بندی با موفقیت ویرایش شد!');
      } else {
        console.error('API Error:', responseData);
        alert(`خطا در ویرایش زیردسته‌بندی: ${responseData.error || response.statusText}`);
      }
    } catch (error) {
      console.error('خطا در ویرایش:', error);
      alert(`خطا در ویرایش زیردسته‌بندی: ${error.message}`);
    }
  };
  // باز/بسته کردن زیردسته‌ها
  const toggleExpanded = (categoryId) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
    }
    setExpandedCategories(newExpanded);
  };

  // باز کردن مودال ویرایش
  const openEditModal = (item, isSubcat = false) => {
    if (!item || !item.id) {
      console.error('Invalid item for edit:', item);
      return;
    }
    setSelectedCategory(item);
    setIsSubcategory(isSubcat);
    setEditForm({ name: item.name || '' });
    setEditModal(true);
  };

  // مدیریت ویرایش
  const handleEdit = () => {
    if (isSubcategory) {
      handleEditSubcategory();
    } else {
      handleEditCategory();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">در حال بارگذاری...</p>
        </div>
      </div>
    );
  }


  return (
    <div dir="rtl" className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 overflow-x-hidden">
      <div className="w-full px-2 sm:px-4 py-4 sm:py-6 space-y-4 sm:space-y-6">
        
        {/* Hero Header */}
        <div className="text-center space-y-3 sm:space-y-4">
          <div className="inline-flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-lg mb-2 sm:mb-4">
            <HiOutlinePencilAlt className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 text-white" />
          </div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent px-2">
            ویرایش دسته‌بندی‌ها
          </h1>
          <p className="text-gray-600 text-xs sm:text-sm md:text-base px-2">
            ویرایش نام دسته‌بندی‌ها و زیردسته‌بندی‌ها
          </p>
        </div>

        {/* Categories List */}
        <div className="w-full">
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg border border-gray-200 p-3 sm:p-4 md:p-8">
            <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
              <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center">
                <HiOutlineTag className="w-3 h-3 sm:w-5 sm:h-5 text-white" />
              </div>
              <h3 className="text-base sm:text-lg md:text-xl font-bold text-slate-800">لیست دسته‌بندی‌ها</h3>
              <div className="mr-auto text-xs sm:text-sm text-gray-600 bg-gray-100 px-2 sm:px-3 py-1 rounded-full">
                {categories.length} دسته‌بندی
              </div>
            </div>
            
            {categories.length > 0 ? (
              <div className="space-y-3 sm:space-y-4">
                {categories.map(category => {
                  const subcategories = category.subcategories || [];
                  const isExpanded = expandedCategories.has(category.id);
                  
                  return (
                    <div key={category.id} className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg sm:rounded-xl p-3 sm:p-4 border border-blue-200">
                      {/* دسته اصلی */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                          {subcategories.length > 0 && (
                            <button
                              onClick={() => toggleExpanded(category.id)}
                              className="w-5 h-5 sm:w-6 sm:h-6 bg-blue-100 rounded-full flex items-center justify-center hover:bg-blue-200 transition-colors flex-shrink-0"
                            >
                              <HiOutlinePlus 
                                className={`w-3 h-3 sm:w-4 sm:h-4 text-blue-600 transition-transform ${
                                  isExpanded ? 'rotate-45' : ''
                                }`} 
                              />
                            </button>
                          )}
                          <div className="w-2 h-2 sm:w-3 sm:h-3 bg-blue-500 rounded-full flex-shrink-0"></div>
                          <span className="font-bold text-gray-800 text-sm sm:text-base truncate">{category.name}</span>
                          {subcategories.length > 0 && (
                            <span className="text-xs bg-blue-100 text-blue-600 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full font-medium flex-shrink-0">
                              {subcategories.length} زیردسته
                            </span>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
                          <button
                            onClick={() => openEditModal(category, false)}
                            className="p-1.5 sm:p-2 bg-gradient-to-r from-yellow-100 to-orange-100 hover:from-yellow-200 hover:to-orange-200 text-yellow-600 rounded-lg transition-all duration-200 transform hover:scale-105"
                            title="ویرایش دسته‌بندی"
                          >
                            <HiOutlinePencilAlt className="w-3 h-3 sm:w-4 sm:h-4" />
                          </button>
                        </div>
                      </div>

                      {/* زیردسته‌ها */}
                      <AnimatePresence>
                        {isExpanded && subcategories.length > 0 && (
                          <motion.div
                            key={`subcategories-${category.id}`}
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            className="mt-3 sm:mt-4 pr-6 sm:pr-9 space-y-2 overflow-hidden"
                          >
                            {subcategories.map((subcategory, index) => (
                              <motion.div 
                                key={subcategory.id ? `subcategory-${subcategory.id}` : `subcategory-${category.id}-${index}`}
                                initial={{ x: -20, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                exit={{ x: -20, opacity: 0 }}
                                transition={{ duration: 0.2 }}
                                className="flex items-center justify-between bg-white rounded-lg p-2.5 sm:p-3 border border-blue-200 shadow-sm"
                              >
                                <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                                  <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-indigo-400 rounded-full flex-shrink-0"></div>
                                  <span className="text-gray-700 font-medium text-sm sm:text-base truncate">{subcategory.name || 'نام نامشخص'}</span>
                                </div>
                                
                                <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
                                  <button
                                    onClick={() => openEditModal(subcategory, true)}
                                    className="p-1 sm:p-1.5 bg-gradient-to-r from-yellow-100 to-orange-100 hover:from-yellow-200 hover:to-orange-200 text-yellow-600 rounded transition-all duration-200 transform hover:scale-105"
                                    title="ویرایش زیردسته‌بندی"
                                    disabled={!subcategory.id}
                                  >
                                    <HiOutlinePencilAlt className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                                  </button>
                                </div>
                              </motion.div>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8 sm:py-12">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-slate-100 to-slate-200 rounded-2xl 
                              flex items-center justify-center mx-auto mb-3 sm:mb-4">
                  <HiOutlineTag className="w-8 h-8 sm:w-10 sm:h-10 text-slate-400" />
                </div>
                <h4 className="text-lg sm:text-xl font-bold text-slate-600 mb-2">دسته‌بندی یافت نشد</h4>
                <p className="text-slate-500 text-sm px-4">
                  هنوز دسته‌بندی ایجاد نشده است. ابتدا دسته‌بندی ایجاد کنید.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Edit Modal */}
        <AnimatePresence>
          {editModal && (
            <div key="edit-modal" className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
              <motion.div
                key="edit-backdrop"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                onClick={() => setEditModal(false)}
              />
              
              <motion.div
                key="edit-content"
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="relative w-full max-w-sm sm:max-w-md bg-white rounded-xl sm:rounded-2xl shadow-2xl p-4 sm:p-6 border border-blue-200"
              >
                <div className="flex items-center justify-between mb-4 sm:mb-6">
                  <h3 className="text-base sm:text-lg font-bold text-slate-800 flex items-center gap-2">
                    <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center">
                      <HiOutlinePencilAlt className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                    </div>
                    <span className="text-sm sm:text-base">ویرایش {isSubcategory ? 'زیردسته‌بندی' : 'دسته‌بندی'}</span>
                  </h3>
                  <button
                    onClick={() => setEditModal(false)}
                    className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 transition-colors"
                  >
                    <HiX className="w-4 h-4 sm:w-5 sm:h-5" />
                  </button>
                </div>

                <div className="space-y-3 sm:space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      نام {isSubcategory ? 'زیردسته‌بندی' : 'دسته‌بندی'}
                    </label>
                    <input
                      type="text"
                      value={editForm.name}
                      onChange={(e) => setEditForm({ name: e.target.value })}
                      className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors text-sm sm:text-base"
                      placeholder={`نام جدید ${isSubcategory ? 'زیردسته‌بندی' : 'دسته‌بندی'}`}
                      autoFocus
                    />
                  </div>
                  
                  {/* نمایش نام قبلی */}
                  <div className="bg-gray-50 rounded-lg p-2.5 sm:p-3">
                    <span className="text-xs sm:text-sm text-gray-600">نام فعلی: </span>
                    <span className="text-xs sm:text-sm font-medium text-gray-800">{selectedCategory?.name}</span>
                  </div>
                </div>

                <div className="flex gap-2 sm:gap-3 mt-4 sm:mt-6">
                  <button
                    onClick={() => setEditModal(false)}
                    className="flex-1 py-2.5 sm:py-3 px-3 sm:px-4 bg-gray-100 text-gray-700 rounded-lg sm:rounded-xl font-medium hover:bg-gray-200 transition-colors text-sm sm:text-base"
                  >
                    انصراف
                  </button>
                  <button
                    onClick={handleEdit}
                    disabled={!editForm.name.trim() || editForm.name === selectedCategory?.name}
                    className="flex-1 py-2.5 sm:py-3 px-3 sm:px-4 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-lg sm:rounded-xl font-medium hover:from-blue-600 hover:to-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-1.5 sm:gap-2 text-sm sm:text-base"
                  >
                    <HiCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    ذخیره تغییرات
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}