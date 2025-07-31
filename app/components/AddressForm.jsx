import React, { useState, useEffect, useCallback } from 'react';
import { 
  MapPinIcon, 
  HomeIcon, 
  PhoneIcon, 
  EnvelopeIcon,
  PlusIcon,
  TrashIcon,
  PencilIcon,
  CheckCircleIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

const AddressDropdown = ({ onAddressSelect }) => {
  const [provinces, setProvinces] = useState([]); // ⭐ تغییر از states به provinces
  const [cities, setCities] = useState([]);
  const [selectedProvince, setSelectedProvince] = useState(''); // ⭐ تغییر از selectedState
  const [selectedCity, setSelectedCity] = useState('');
  const [loadingProvinces, setLoadingProvinces] = useState(false); // ⭐ تغییر نام
  const [loadingCities, setLoadingCities] = useState(false);

  // دریافت لیست استان‌ها
  useEffect(() => {
    const fetchProvinces = async () => { // ⭐ تغییر نام function
      setLoadingProvinces(true);
      try {
        // ⭐ تغییر از /api/states به /api/provinces
        const response = await fetch('/api/provinces');
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        
        const result = await response.json();
        console.log('🏛️ استان‌های دریافتی:', result); // برای debug
        
        if (result.success && Array.isArray(result.data)) {
          setProvinces(result.data);
          console.log(`✅ ${result.data.length} استان بارگذاری شد`);
        } else {
          console.error('❌ خطا در ساختار داده‌های استان‌ها:', result);
        }
      } catch (error) {
        console.error('❌ خطا در دریافت استان‌ها:', error);
      } finally {
        setLoadingProvinces(false);
      }
    };

    fetchProvinces();
  }, []);

  // دریافت شهرها بر اساس استان انتخاب شده
  useEffect(() => {
    if (selectedProvince) {
      const fetchCities = async () => {
        setLoadingCities(true);
        setCities([]);
        setSelectedCity('');

        try {
          // ⭐ تغییر از /api/cities/${selectedState} به query parameter
          const response = await fetch(`/api/cities?province_id=${selectedProvince}`);
          const result = await response.json();
          console.log('🏙️ شهرهای دریافتی:', result); // برای debug
          
          if (result.success && Array.isArray(result.data)) {
            setCities(result.data);
            console.log(`✅ ${result.data.length} شهر بارگذاری شد`);
          } else {
            console.error('❌ خطا در ساختار داده‌های شهرها:', result);
          }
        } catch (error) {
          console.error('❌ خطا در دریافت شهرها:', error);
        } finally {
          setLoadingCities(false);
        }
      };

      fetchCities();
    } else {
      setCities([]);
      setSelectedCity('');
    }
  }, [selectedProvince]); // ⭐ تغییر dependency

  // ارسال اطلاعات انتخاب شده به والد
  useEffect(() => {
    if (selectedProvince && selectedCity) {
      const selectedProvinceData = provinces.find((p) => p.id == selectedProvince); // ⭐ تغییر نام متغیر
      const selectedCityData = cities.find((c) => c.id == selectedCity);

      if (selectedProvinceData && selectedCityData) {
        console.log('📍 انتخاب نهایی:', {
          province: selectedProvinceData,
          city: selectedCityData
        });
        
        onAddressSelect({
          state: selectedProvinceData, // برای سازگاری با کد قبلی
          city: selectedCityData,
          province: selectedProvinceData // اضافه کردن province برای وضوح
        });
      }
    }
  }, [selectedProvince, selectedCity, provinces, cities, onAddressSelect]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* انتخاب استان */}
      <div className="relative">
        <label className="block text-sm font-semibold text-[#0F2C59] mb-2 flex items-center">
          <MapPinIcon className="w-4 h-4 ml-1" />
          استان
        </label>
        <select
          value={selectedProvince}
          onChange={(e) => setSelectedProvince(e.target.value)}
          className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#0F2C59] focus:ring-2 focus:ring-[#0F2C59]/10 transition-all duration-300 text-gray-700"
          disabled={loadingProvinces}
        >
          <option value="">
            {loadingProvinces ? 'در حال بارگذاری...' : 'انتخاب استان'}
          </option>
          {provinces.map((province) => (
            <option key={province.id} value={province.id}>
              {province.name}
            </option>
          ))}
        </select>
        {/* نمایش تعداد استان‌ها */}
        {provinces.length > 0 && (
          <p className="text-xs text-gray-500 mt-1">
            {provinces.length} استان موجود
          </p>
        )}
      </div>

      {/* انتخاب شهر */}
      <div className="relative">
        <label className="block text-sm font-semibold text-[#0F2C59] mb-2 flex items-center">
          <HomeIcon className="w-4 h-4 ml-1" />
          شهر
        </label>
        <select
          value={selectedCity}
          onChange={(e) => setSelectedCity(e.target.value)}
          className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#0F2C59] focus:ring-2 focus:ring-[#0F2C59]/10 transition-all duration-300 text-gray-700"
          disabled={!selectedProvince || loadingCities}
        >
          <option value="">
            {loadingCities
              ? 'در حال بارگذاری...'
              : !selectedProvince
              ? 'ابتدا استان را انتخاب کنید'
              : 'انتخاب شهر'}
          </option>
          {cities.map((city) => (
            <option key={city.id} value={city.id}>
              {city.name}
            </option>
          ))}
        </select>
        {/* نمایش تعداد شهرها */}
        {cities.length > 0 && (
          <p className="text-xs text-gray-500 mt-1">
            {cities.length} شهر موجود
          </p>
        )}
      </div>

      {/* نمایش انتخاب شده */}
      {selectedProvince && selectedCity && (
        <div className="md:col-span-2 bg-gradient-to-r from-[#0F2C59]/5 to-[#0F2C59]/10 border border-[#0F2C59]/20 rounded-xl p-4">
          <div className="flex items-center">
            <CheckCircleIcon className="w-5 h-5 text-[#0F2C59] ml-2" />
            <p className="text-sm font-medium text-[#0F2C59]">
              انتخاب شده: {cities.find((c) => c.id == selectedCity)?.name}، {provinces.find((p) => p.id == selectedProvince)?.name}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

// فرم آدرس برای استفاده در صفحه پروفایل
const AddressForm = ({ onSubmit, showSavedAddresses = true }) => {
  const [addressData, setAddressData] = useState({
    address: '',
    house_no: '',
    phone_number: '',
    postalcode: '',
  });
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const handleAddressSelect = useCallback((location) => {
    console.log('📍 مکان انتخاب شده:', location);
    setSelectedLocation(location);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });

    console.log('📤 شروع ارسال فرم...', { selectedLocation, addressData });

    if (!selectedLocation) {
      setMessage({ type: 'error', text: 'لطفاً استان و شهر را انتخاب کنید' });
      return;
    }

    if (!addressData.address.trim() || !addressData.phone_number.trim()) {
      setMessage({ type: 'error', text: 'لطفاً فیلدهای ضروری را پر کنید' });
      return;
    }

    // ⭐ اصلاح ساختار داده‌های ارسالی
    const finalData = {
      address: addressData.address.trim(),
      house_no: addressData.house_no || null,
      phone_number: addressData.phone_number.trim(),
      postalcode: addressData.postalcode || null,
      // ⭐ استفاده از province_id و city_id (API جدید)
      province_id: selectedLocation.state?.id || selectedLocation.province?.id,
      city_id: selectedLocation.city.id,
      // ⭐ اضافه کردن نام‌ها برای نمایش
      city: selectedLocation.city.name,
      state_name: selectedLocation.state?.name || selectedLocation.province?.name
    };

    console.log('📦 داده‌های نهایی:', finalData);

    setIsSubmitting(true);

    try {
      if (onSubmit) {
        await onSubmit(finalData);
        setMessage({ 
          type: 'success', 
          text: 'آدرس با موفقیت ثبت شد!' 
        });
        
        // پاک کردن فرم
        setAddressData({
          address: '',
          house_no: '',
          phone_number: '',
          postalcode: '',
        });
        setSelectedLocation(null);
      }
    } catch (error) {
      console.error('❌ خطا در ثبت آدرس:', error);
      setMessage({ 
        type: 'error', 
        text: 'خطا در ثبت آدرس: ' + (error.message || 'خطای نامشخص')
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6" style={{ fontFamily: 'Vazirmatn, system-ui, sans-serif', direction: 'rtl' }}>
      {/* نمایش پیام */}
      {message.text && (
        <div className={`p-4 rounded-xl border-2 ${
          message.type === 'success' 
            ? 'bg-green-50 border-green-200 text-green-800' 
            : 'bg-red-50 border-red-200 text-red-800'
        } flex items-center justify-between`}>
          <div className="flex items-center">
            {message.type === 'success' ? (
              <CheckCircleIcon className="w-5 h-5 ml-2" />
            ) : (
              <XMarkIcon className="w-5 h-5 ml-2" />
            )}
            <p className="font-medium">{message.text}</p>
          </div>
          <button 
            onClick={() => setMessage({ type: '', text: '' })}
            className="text-gray-500 hover:text-gray-700"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* فرم آدرس جدید */}
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
        <div className="bg-gradient-to-r from-[#0F2C59] to-[#0F2C59]/80 px-6 py-4">
          <h2 className="text-xl font-bold text-white flex items-center">
            <PlusIcon className="w-6 h-6 ml-2" />
            افزودن آدرس جدید
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* انتخاب استان و شهر */}
          <AddressDropdown onAddressSelect={handleAddressSelect} />

          {/* فیلدهای آدرس */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-[#0F2C59] mb-2">
                آدرس کامل <span className="text-red-500">*</span>
              </label>
              <textarea
                value={addressData.address}
                onChange={(e) =>
                  setAddressData({ ...addressData, address: e.target.value })
                }
                className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#0F2C59] focus:ring-2 focus:ring-[#0F2C59]/10 transition-all duration-300 resize-none"
                rows="3"
                placeholder="مثال: خیابان آزادی، کوچه گلستان، نبش کوچه دوم"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#0F2C59] mb-2">
                شماره پلاک
              </label>
              <input
                type="text"
                value={addressData.house_no}
                onChange={(e) =>
                  setAddressData({ ...addressData, house_no: e.target.value })
                }
                className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#0F2C59] focus:ring-2 focus:ring-[#0F2C59]/10 transition-all duration-300"
                placeholder="15"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#0F2C59] mb-2">
                شماره تلفن <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                value={addressData.phone_number}
                onChange={(e) =>
                  setAddressData({ ...addressData, phone_number: e.target.value })
                }
                className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#0F2C59] focus:ring-2 focus:ring-[#0F2C59]/10 transition-all duration-300"
                placeholder="09123456789"
                required
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-[#0F2C59] mb-2">
                کد پستی
              </label>
              <input
                type="text"
                value={addressData.postalcode}
                onChange={(e) =>
                  setAddressData({ ...addressData, postalcode: e.target.value })
                }
                className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#0F2C59] focus:ring-2 focus:ring-[#0F2C59]/10 transition-all duration-300"
                placeholder="1234567890"
                maxLength="10"
              />
            </div>
          </div>

          {/* دکمه‌های عمل */}
          <div className="flex gap-4 pt-4 border-t border-gray-100">
            <button
              type="submit"
              disabled={isSubmitting}
              className={`flex-1 py-3 px-6 rounded-xl font-semibold transition-all duration-300 ${
                isSubmitting
                  ? 'bg-gray-400 text-gray-700 cursor-not-allowed'
                  : 'bg-[#0F2C59] text-white hover:bg-[#0F2C59]/90 shadow-lg hover:shadow-xl'
              }`}
            >
              {isSubmitting ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white ml-2"></div>
                  در حال ثبت...
                </div>
              ) : (
                <div className="flex items-center justify-center">
                  <CheckCircleIcon className="w-5 h-5 ml-2" />
                  ثبت آدرس
                </div>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddressForm;