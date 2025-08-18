'use client';
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ForgotPasswordModal from '../components/ForgotPasswordModal';
import { toast } from 'react-toastify'; 


export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    phoneNumber: '',
    confirmPassword: '',
    role: ''
  });
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [showRoleSelector, setShowRoleSelector] = useState(false);
  const [isRoleSelectorOpen, setIsRoleSelectorOpen] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);

  const handleNavigation = (path) => {
    window.location.href = path;
  };

  const handleForgotPassword = () => {
    setShowForgotModal(true);
  };

  // Reset errors when switching between login and register
  useEffect(() => {
    setError('');
    setFormErrors({});
    setShowRoleSelector(false);
    setFormData({
      username: '',
      email: '',
      password: '',
      phoneNumber: '',
      confirmPassword: '',
      role: ''
    });
  }, [isLogin]);

  // Show role selector after form is displayed
  useEffect(() => {
    if (!showRoleSelector) {
      setTimeout(() => {
        setShowRoleSelector(true);
      }, 300);
    }
  }, [showRoleSelector]);

    useEffect(() => {
      if (typeof window !== 'undefined') {
        const params = new URLSearchParams(window.location.search);
        const message = params.get('message');
        if (message) {
          toast.info(decodeURIComponent(message), {
            position: "top-right",
            autoClose: 4000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            theme: "colored",
          });
        }
      }
    }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear specific field error when user starts typing
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const selectRole = (role) => {
    setFormData(prev => ({
      ...prev,
      role: role
    }));
    setIsRoleSelectorOpen(false);
    
    if (formErrors.role) {
      setFormErrors(prev => ({
        ...prev,
        role: ''
      }));
    }
  };

  const toggleRoleSelector = () => {
    setIsRoleSelectorOpen(!isRoleSelectorOpen);
  };

  const validateForm = () => {
    const errors = {};
    
    if (!formData.username.trim()) {
      errors.username = 'نام کاربری الزامی است';
    }
    
    if (!isLogin) {
      if (!formData.email.trim()) {
        errors.email = 'ایمیل الزامی است';
      } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
        errors.email = 'فرمت ایمیل صحیح نیست';
      }
      
      if (!formData.phoneNumber.trim()) {
        errors.phoneNumber = 'شماره تلفن الزامی است';
      } else if (!/^(09|\+989)\d{9}$/.test(formData.phoneNumber.replace(/\s+/g, ''))) {
        errors.phoneNumber = 'فرمت شماره تلفن صحیح نیست';
      }
      
      if (!formData.confirmPassword) {
        errors.confirmPassword = 'تکرار رمز عبور الزامی است';
      } else if (formData.password !== formData.confirmPassword) {
        errors.confirmPassword = 'رمز عبور و تکرار آن مطابقت ندارند';
      }
    }
    
    if (!formData.password) {
      errors.password = 'رمز عبور الزامی است';
    } else if (!isLogin && formData.password.length < 8) {
      errors.password = 'رمز عبور باید حداقل ۸ کاراکتر باشد';
    }
    
    if (!formData.role) {
      errors.role = 'انتخاب نقش کاربری الزامی است';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setError('');
    
    try {
      const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();
      
      if (!response.ok) {
        setError(result.message || 'خطا در عملیات. لطفا دوباره تلاش کنید.');
        setIsLoading(false);
        return;
      }

      console.log('✅ Login successful, saving data:', result);

      // ⭐ ذخیره کامل اطلاعات در localStorage
      localStorage.setItem('token', result.token);
      localStorage.setItem('user', JSON.stringify(result.user));
      localStorage.setItem('isLoggedIn', 'true');
      localStorage.setItem('userRole', result.user.role);

      console.log('💾 Data saved to localStorage:', {
        token: !!localStorage.getItem('token'),
        user: localStorage.getItem('user'),
        isLoggedIn: localStorage.getItem('isLoggedIn')
      });

      // ⭐ اعلان به سیستم که localStorage تغییر کرده
      window.dispatchEvent(new Event('storage'));
      window.dispatchEvent(new CustomEvent('userLogin', { detail: result.user }));

      // اعلام موفقیت
      setIsLoading(false);
      toast.success(isLogin ? 'ورود موفقیت‌آمیز!' : 'ثبت‌نام موفقیت‌آمیز!', {
        position: "top-right",
        autoClose: 4000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: "colored",
      });

      setTimeout(() => {
        const redirectPath = result.user.role === 'admin' ? '/admin/dashboard' : '/';
        console.log('🔄 Redirecting to:', redirectPath);
        handleNavigation(redirectPath);
      }, 1000);
      
    } catch (error) {
      console.error('Error:', error);
      setError('خطا در برقراری ارتباط با سرور. لطفا دوباره تلاش کنید.');
      setIsLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  return (
    <>
      <div 
        className="min-h-screen flex items-center justify-center relative p-4"
        style={{ 
          fontFamily: 'Vazirmatn, system-ui, sans-serif', 
          direction: 'rtl',
          background: 'linear-gradient(to bottom, #E8EBF2, #B7C4CF)',
        }}
      >
        {/* Back button with improved styling */}
        <div className="fixed top-6 right-6 z-20">
          <a 
            href="/" 
            className="flex items-center text-navy-700 hover:text-blue-600 transition-colors rounded-full bg-white/90 backdrop-blur-md py-2.5 px-5 shadow-lg hover:shadow-xl transform hover:scale-105  duration-300"
          >
            <span className="font-medium">بازگشت به صفحه اصلی</span>
            <svg className="h-4 w-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </a>
        </div>

        {/* Main container with improved shadows and rounded corners */}
        <div className="w-full max-w-5xl bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden flex relative border border-white/30 z-10">
          {/* Left side panel - Only visible in desktop */}
          <div
            className="w-2/5 bg-gradient-to-br hidden lg:flex flex-col justify-center relative overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, #0a2472 0%, #0e1e5b 100%)',
            }}
          >
            {/* Decorative elements */}
            <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
              <svg className="absolute top-0 left-0 w-full h-full opacity-10" viewBox="0 0 600 600" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="100" cy="100" r="80" fill="white" fillOpacity="0.2" />
                <circle cx="500" cy="400" r="150" fill="white" fillOpacity="0.1" />
                <path d="M600,0 L600,600 L0,600 C150,500 300,350 300,200 C300,100 400,0 600,0 Z" fill="white" fillOpacity="0.05" />
              </svg>
              <div className="absolute inset-0 bg-gradient-to-b from-blue-900/10 to-transparent"></div>
            </div>
            
            {/* Animation container */}
            <AnimatePresence mode="wait">
              {isLogin ? (
                <motion.div
                  key="login-panel"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                  className="relative z-10 text-center flex flex-col items-center px-10 py-12"
                >
                  <div className="mb-8 flex items-center justify-center">
                    <div className="relative">
                      <div className="absolute inset-0 bg-blue-400 blur-lg opacity-30 rounded-full"></div>
                      <svg
                        className="h-20 w-20 text-white relative"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" 
                          d="M12 11c-1.657 0-3-1.343-3-3s1.343-3 3-3 3 1.343 3 3-1.343 3-3 3z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" 
                          d="M12 14c-3.866 0-7 3.134-7 7h14c0-3.866-3.134-7-7-7z" />
                      </svg>
                    </div>
                  </div>
                  
                  <p className="text-lg mb-10 text-blue-200 font-medium">
                    هنوز حساب کاربری ندارید؟
                  </p>
                  <button
                    onClick={() => setIsLogin(false)}
                    className="bg-white text-blue-900 px-10 py-3.5 rounded-full font-bold shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1"
                    style={{
                      boxShadow: '0 10px 25px -5px rgba(10,36,114,0.5)',
                    }}
                  >
                    ثبت نام
                  </button>
                </motion.div>
              ) : (
                <motion.div
                  key="register-panel"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                  className="relative z-10 text-center flex flex-col items-center px-10 py-12"
                >
                  <div className="mb-8 flex items-center justify-center">
                    <div className="relative">
                      <div className="absolute inset-0 bg-blue-400 blur-lg opacity-30 rounded-full"></div>
                      <svg
                        className="h-20 w-20 text-white relative"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" 
                          d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                      </svg>
                    </div>
                  </div>
                
                  <p className="text-lg mb-10 text-blue-200 font-medium">
                    حساب کاربری دارید؟
                  </p>
                  <button
                    onClick={() => setIsLogin(true)}
                    className="bg-white text-blue-900 px-10 py-3.5 rounded-full font-bold shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1"
                    style={{
                      boxShadow: '0 10px 25px -5px rgba(10,36,114,0.5)',
                    }}
                  >
                    ورود
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Form section with improved styling */}
          <div className="w-full lg:w-3/5 p-6 md:p-12 flex flex-col justify-center">
            <div className="w-full max-w-md mx-auto">
              <AnimatePresence mode="wait">
                <motion.div
                  key={isLogin ? "login-form" : "register-form"}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                >
                  <div className="text-center mb-8">
                    <h3 className="text-3xl font-bold text-gray-800 mb-2">
                      {isLogin ? 'ورود به حساب کاربری' : 'ایجاد حساب کاربری'}
                    </h3>
                    
                    {/* Mobile toggle buttons */}
                    <div className="lg:hidden mt-4">
                      <p className="text-gray-600 text-sm mb-4">
                        {isLogin ? 'حساب کاربری ندارید؟' : 'قبلاً حساب کاربری دارید؟'}
                      </p>
                      <button
                        onClick={() => setIsLogin(!isLogin)}
                        className="text-blue-600 hover:text-blue-800 font-bold transition-colors"
                      >
                        {isLogin ? 'ثبت نام' : 'ورود'}
                      </button>
                    </div>
                  </div>

                  {/* Form content */}
                  <div className="space-y-5">
                    {error && (
                      <motion.div 
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-center text-sm shadow-sm"
                      >
                        {error}
                      </motion.div>
                    )}

                    {/* Username Field */}
                    <div className="space-y-1.5">
                      <div className="relative group">
                        <svg className="absolute right-4 top-1/2 transform -translate-y-1/2 text-blue-800 h-5 w-5 opacity-70 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        <input
                          type="text"
                          name="username"
                          placeholder="نام کاربری"
                          value={formData.username}
                          onChange={handleInputChange}
                          className={`w-full py-3.5 pr-12 pl-4 border rounded-xl text-sm ${
                            formErrors.username ? 'border-red-300 bg-red-50' : 'border-blue-100 bg-gray-50 group-hover:bg-white focus:bg-white'
                          } focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all shadow-sm`}
                        />
                      </div>
                      {formErrors.username && (
                        <motion.p 
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="text-red-600 text-xs text-right pr-2"
                        >
                          {formErrors.username}
                        </motion.p>
                      )}
                    </div>

                    {/* Role Selector with improved animation */}
                    <div className={`transition-all duration-500 ease-in-out space-y-1.5 ${showRoleSelector ? 'opacity-100 max-h-40' : 'opacity-0 max-h-0 overflow-hidden'}`}>
                      <div className="relative group">
                        <svg className="absolute right-4 top-1/2 transform -translate-y-1/2 text-blue-800 h-5 w-5 opacity-70 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        <button
                          type="button"
                          onClick={toggleRoleSelector}
                          className={`w-full flex items-center justify-between py-3.5 pr-12 pl-4 border rounded-xl text-sm ${
                            formErrors.role ? 'border-red-300 bg-red-50' : 'border-blue-100 bg-gray-50 hover:bg-white focus:bg-white'
                          } focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all shadow-sm ${formData.role ? 'text-gray-700' : 'text-gray-400'}`}
                        >
                          {formData.role ? (formData.role === 'admin' ? 'مدیر' : 'مشتری') : 'نقش کاربری'}
                          <svg className={`h-5 w-5 transition-transform duration-300 ${isRoleSelectorOpen ? 'transform rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </button>
                        
                        {isRoleSelectorOpen && (
                          <motion.div 
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.2 }}
                            className="absolute z-20 mt-1 w-full rounded-xl bg-white border border-blue-100 shadow-lg overflow-hidden"
                          >
                            <button
                              type="button"
                              onClick={() => selectRole('customer')}
                              className="w-full text-right px-4 py-3 text-sm text-gray-700 hover:bg-blue-50 transition-colors"
                            >
                              مشتری
                            </button>
                            <button
                              type="button"
                              onClick={() => selectRole('admin')}
                              className="w-full text-right px-4 py-3 text-sm text-gray-700 hover:bg-blue-50 transition-colors"
                            >
                              مدیر
                            </button>
                          </motion.div>
                        )}
                      </div>
                      {formErrors.role && (
                        <motion.p 
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="text-red-600 text-xs text-right pr-2"
                        >
                          {formErrors.role}
                        </motion.p>
                      )}
                    </div>

                    {!isLogin && (
                      <>
                        {/* Email Field */}
                        <div className="space-y-1.5">
                          <div className="relative group">
                            <svg className="absolute right-4 top-1/2 transform -translate-y-1/2 text-blue-800 h-5 w-5 opacity-70 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                            <input
                              type="email"
                              name="email"
                              placeholder="ایمیل"
                              value={formData.email}
                              onChange={handleInputChange}
                              className={`w-full py-3.5 pr-12 pl-4 border rounded-xl text-sm ${
                                formErrors.email ? 'border-red-300 bg-red-50' : 'border-blue-100 bg-gray-50 group-hover:bg-white focus:bg-white'
                              } focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all shadow-sm`}
                            />
                          </div>
                          {formErrors.email && (
                            <motion.p 
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              className="text-red-600 text-xs text-right pr-2"
                            >
                              {formErrors.email}
                            </motion.p>
                          )}
                        </div>

                        {/* Phone Number Field */}
                        <div className="space-y-1.5">
                          <div className="relative group">
                            <svg className="absolute right-4 top-1/2 transform -translate-y-1/2 text-blue-800 h-5 w-5 opacity-70 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                            </svg>
                            <input
                              type="tel"
                              name="phoneNumber"
                              placeholder="شماره تلفن"
                              value={formData.phoneNumber}
                              onChange={handleInputChange}
                              className={`w-full py-3.5 pr-12 pl-4 border rounded-xl text-sm ${
                                formErrors.phoneNumber ? 'border-red-300 bg-red-50' : 'border-blue-100 bg-gray-50 group-hover:bg-white focus:bg-white'
                              } focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all shadow-sm`}
                            />
                          </div>
                          {formErrors.phoneNumber && (
                            <motion.p 
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              className="text-red-600 text-xs text-right pr-2"
                            >
                              {formErrors.phoneNumber}
                            </motion.p>
                          )}
                        </div>
                      </>
                    )}

                    {/* Password Field */}
                    <div className="space-y-1.5">
                      <div className="relative group">
                        <svg className="absolute right-4 top-1/2 transform -translate-y-1/2 text-blue-800 h-5 w-5 opacity-70 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                        <input
                          type={showPassword ? "text" : "password"}
                          name="password"
                          placeholder="رمز عبور"
                          value={formData.password}
                          onChange={handleInputChange}
                          className={`w-full py-3.5 pr-12 pl-10 border rounded-xl text-sm ${
                            formErrors.password ? 'border-red-300 bg-red-50' : 'border-blue-100 bg-gray-50 group-hover:bg-white focus:bg-white'
                          } focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all shadow-sm`}
                        />
                        <button 
                          type="button"
                          className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-800 opacity-70 hover:opacity-100 transition-opacity"
                          onClick={togglePasswordVisibility}
                        >
                          {showPassword ? 
                            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L9.878 9.878c.186-.186.375-.361.57-.527m4.242 4.242L9.878 9.878m4.242 4.242a3 3 0 01-4.243-4.243m0 0a9.97 9.97 0 013.029-1.563M21 12a9 9 0 01-1.057 4.207m0 0L15.5 12.5M21 12l-4.5 4.5" />
                            </svg> : 
                            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          }
                        </button>
                      </div>
                      {formErrors.password && (
                        <p className="text-red-600 text-xs text-right pr-2">{formErrors.password}</p>
                      )}
                    </div>

                    {!isLogin && (
                      <div className="space-y-1">
                        <div className="relative">
                          <svg className="absolute right-4 top-1/2 transform -translate-y-1/2 text-blue-800 h-5 w-5 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                          </svg>
                          <input
                            type={showConfirmPassword ? "text" : "password"}
                            name="confirmPassword"
                            placeholder="تکرار رمز عبور"
                            value={formData.confirmPassword}
                            onChange={handleInputChange}
                            className={`w-full py-3 pr-12 pl-10 border rounded-xl bg-gray-50 text-sm ${
                              formErrors.confirmPassword ? 'border-red-300 bg-red-50' : 'border-blue-100'
                            } focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-200 transition-all shadow-sm`}
                          />
                          <button 
                            type="button"
                            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-800 opacity-70 hover:opacity-100"
                            onClick={toggleConfirmPasswordVisibility}
                          >
                            {showConfirmPassword ? 
                              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L9.878 9.878c.186-.186.375-.361.57-.527m4.242 4.242L9.878 9.878m4.242 4.242a3 3 0 01-4.243-4.243m0 0a9.97 9.97 0 013.029-1.563M21 12a9 9 0 01-1.057 4.207m0 0L15.5 12.5M21 12l-4.5 4.5" />
                              </svg> : 
                              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                            }
                          </button>
                        </div>
                        {formErrors.confirmPassword && (
                          <p className="text-red-600 text-xs text-right">{formErrors.confirmPassword}</p>
                        )}
                      </div>
                    )}

                    {isLogin && (
                      <div className="text-right">
                        <button 
                          type="button"
                          onClick={handleForgotPassword}
                          className="text-sm text-blue-700 hover:text-blue-800 transition-colors underline"
                        >
                          فراموشی رمز عبور؟
                        </button>
                      </div>
                    )}

                    <button
                      type="button"
                      onClick={handleSubmit}
                      disabled={isLoading}
                      className="w-full bg-[#0F2C59] text-white py-3 rounded-lg font-bold transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-70"
                    >
                      {isLoading ? (
                        <span className="flex items-center justify-center">
                          <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          در حال پردازش...
                        </span>
                      ) : (
                        isLogin ? 'ورود' : 'ثبت نام'
                      )}
                    </button>

                    {/* Social login */}
                    <div className="text-center mt-6">
                      <div className="flex justify-center space-x-4 space-x-reverse">
                      </div>
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>

      {/* Forgot Password Modal */}
      <ForgotPasswordModal 
        isOpen={showForgotModal} 
        onClose={() => setShowForgotModal(false)} 
      />
    </>
  );
}