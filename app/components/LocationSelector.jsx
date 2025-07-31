import React, { useState, useEffect } from 'react';

const LocationSelector = () => {
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [selectedState, setSelectedState] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [loadingStates, setLoadingStates] = useState(false);
  const [loadingCities, setLoadingCities] = useState(false);
  const [error, setError] = useState('');

  // دریافت استان‌ها هنگام بارگذاری کامپوننت
  useEffect(() => {
    fetchStates();
  }, []);

  // دریافت استان‌ها
  const fetchStates = async () => {
    setLoadingStates(true);
    setError('');
    
    try {
      const response = await fetch('/api/states');
      const result = await response.json();
      
      console.log('📊 پاسخ استان‌ها:', result);
      
      if (result.success && result.data) {
        setStates(result.data);
        console.log('✅ استان‌ها دریافت شدند:', result.data.length);
      } else {
        setError(result.error || 'خطا در دریافت استان‌ها');
        console.error('❌ خطا در دریافت استان‌ها:', result);
      }
    } catch (err) {
      setError('خطا در اتصال به سرور');
      console.error('❌ خطا:', err);
    } finally {
      setLoadingStates(false);
    }
  };

  // دریافت شهرها بر اساس استان انتخاب شده
  const fetchCities = async (stateId) => {
    if (!stateId) return;
    
    setLoadingCities(true);
    setError('');
    setCities([]);
    setSelectedCity('');
    
    try {
      const response = await fetch(`/api/cities/${stateId}`);
      const result = await response.json();
      
      console.log('📊 پاسخ شهرها:', result);
      
      if (result.success && result.data) {
        setCities(result.data);
        console.log('✅ شهرها دریافت شدند:', result.data.length);
      } else {
        setError(result.error || 'خطا در دریافت شهرها');
        console.error('❌ خطا در دریافت شهرها:', result);
      }
    } catch (err) {
      setError('خطا در اتصال به سرور');
      console.error('❌ خطا:', err);
    } finally {
      setLoadingCities(false);
    }
  };

  // تغییر استان
  const handleStateChange = (e) => {
    const stateId = e.target.value;
    setSelectedState(stateId);
    
    if (stateId) {
      fetchCities(stateId);
    } else {
      setCities([]);
      setSelectedCity('');
    }
  };

  // تغییر شهر
  const handleCityChange = (e) => {
    setSelectedCity(e.target.value);
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">
        انتخاب استان و شهر
      </h2>
      
      {/* نمایش خطا */}
      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      {/* انتخاب استان */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          استان:
        </label>
        <select
          value={selectedState}
          onChange={handleStateChange}
          disabled={loadingStates}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
        >
          <option value="">
            {loadingStates ? 'در حال بارگذاری...' : 'انتخاب استان'}
          </option>
          {states.map((state) => (
            <option key={state.id} value={state.id}>
              {state.name}
            </option>
          ))}
        </select>
      </div>

      {/* انتخاب شهر */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          شهر:
        </label>
        <select
          value={selectedCity}
          onChange={handleCityChange}
          disabled={!selectedState || loadingCities}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
        >
          <option value="">
            {loadingCities ? 'در حال بارگذاری...' : 
             !selectedState ? 'ابتدا استان را انتخاب کنید' : 'انتخاب شهر'}
          </option>
          {cities.map((city) => (
            <option key={city.id} value={city.id}>
              {city.name}
            </option>
          ))}
        </select>
      </div>

      {/* نمایش انتخاب‌های کاربر */}
      {selectedState && selectedCity && (
        <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-md">
          <h3 className="font-medium text-green-800 mb-2">آدرس انتخاب شده:</h3>
          <p className="text-green-700">
            استان: {states.find(s => s.id === selectedState)?.name} <br />
            شهر: {cities.find(c => c.id === selectedCity)?.name}
          </p>
        </div>
      )}

      {/* اطلاعات دیباگ */}
      <div className="mt-6 p-4 bg-gray-50 border border-gray-200 rounded-md text-sm">
        <h4 className="font-medium text-gray-800 mb-2">اطلاعات دیباگ:</h4>
        <p>تعداد استان‌ها: {states.length}</p>
        <p>تعداد شهرها: {cities.length}</p>
        <p>استان انتخاب شده: {selectedState || 'هیچ'}</p>
        <p>شهر انتخاب شده: {selectedCity || 'هیچ'}</p>
      </div>
    </div>
  );
};

export default LocationSelector;