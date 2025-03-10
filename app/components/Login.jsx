'use client';

import React, { useState, useEffect } from 'react';
import { 
  HiOutlineUser, 
  HiOutlineEnvelope, 
  HiOutlineLockClosed, 
  HiOutlinePhone,
  HiOutlineEye,
  HiOutlineEyeSlash,
  HiOutlineArrowRight
} from 'react-icons/hi2';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    phoneNumber: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const router = useRouter();

  // Reset errors when switching between login and register
  useEffect(() => {
    setError('');
    setFormErrors({});
    setFormData({
      username: '',
      email: '',
      password: '',
      phoneNumber: '',
      confirmPassword: ''
    });
  }, [isLogin]);

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

      localStorage.setItem('jwtToken', result.token);
      localStorage.setItem('isLoggedIn', 'true');
      
      // Show success message with timeout before redirect
      setIsLoading(false);
      
      // Success notification
      const successMessage = document.getElementById('successNotification');
      successMessage.classList.remove('opacity-0', 'translate-y-4');
      successMessage.classList.add('opacity-100', 'translate-y-0');
      
      setTimeout(() => {
        router.push('/');
      }, 1500);
      
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
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-[#800020] to-[#4A0E2A] p-4">
      {/* Back button */}
      <div className="absolute top-4 right-4">
        <Link href="/" className="flex items-center text-white hover:text-gray-200 transition-colors">
          <HiOutlineArrowRight className="mr-1" />
          <span>بازگشت به صفحه اصلی</span>
        </Link>
      </div>
      
      {/* Success notification */}
      <div 
        id="successNotification" 
        className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg opacity-0 translate-y-4 transition-all duration-300 z-50"
      >
        <div className="flex items-center justify-center">
          <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
          </svg>
          <span>{isLogin ? 'ورود با موفقیت انجام شد!' : 'ثبت نام با موفقیت انجام شد!'}</span>
        </div>
      </div>
      
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden relative">
        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-16 h-16 bg-[#800020]/10 rounded-full -translate-x-8 -translate-y-8"></div>
        <div className="absolute bottom-0 right-0 w-24 h-24 bg-[#800020]/10 rounded-full translate-x-12 translate-y-12"></div>
        
        <div className="p-8 relative z-10">
          <h2 className="text-3xl font-bold text-center text-[#800020] mb-8">
            {isLogin ? 'ورود به حساب' : 'ثبت نام'}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-300 text-red-800 px-4 py-3 rounded-lg text-center text-sm">
                {error}
              </div>
            )}

            {/* Username Field */}
            <div className="space-y-1">
              <div className="relative">
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <HiOutlineUser className="text-[#800020]/70" />
                </div>
                <input
                  type="text"
                  name="username"
                  placeholder="نام کاربری"
                  value={formData.username}
                  onChange={handleInputChange}
                  className={`w-full py-3 pr-10 pl-3 rounded-lg border ${formErrors.username ? 'border-red-500 bg-red-50' : 'border-gray-300'} focus:border-[#800020] focus:ring-2 focus:ring-[#800020]/30 text-right placeholder-gray-400 transition-all`}
                />
              </div>
              {formErrors.username && (
                <p className="text-red-600 text-xs text-right">{formErrors.username}</p>
              )}
            </div>

            {!isLogin && (
              <>
                {/* Email Field */}
                <div className="space-y-1">
                  <div className="relative">
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                      <HiOutlineEnvelope className="text-[#800020]/70" />
                    </div>
                    <input
                      type="email"
                      name="email"
                      placeholder="ایمیل"
                      value={formData.email}
                      onChange={handleInputChange}
                      className={`w-full py-3 pr-10 pl-3 rounded-lg border ${formErrors.email ? 'border-red-500 bg-red-50' : 'border-gray-300'} focus:border-[#800020] focus:ring-2 focus:ring-[#800020]/30 text-right placeholder-gray-400 transition-all`}
                    />
                  </div>
                  {formErrors.email && (
                    <p className="text-red-600 text-xs text-right">{formErrors.email}</p>
                  )}
                </div>

                {/* Phone Number Field */}
                <div className="space-y-1">
                  <div className="relative">
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                      <HiOutlinePhone className="text-[#800020]/70" />
                    </div>
                    <input
                      type="tel"
                      name="phoneNumber"
                      placeholder="شماره تلفن"
                      value={formData.phoneNumber}
                      onChange={handleInputChange}
                      className={`w-full py-3 pr-10 pl-3 rounded-lg border ${formErrors.phoneNumber ? 'border-red-500 bg-red-50' : 'border-gray-300'} focus:border-[#800020] focus:ring-2 focus:ring-[#800020]/30 text-right placeholder-gray-400 transition-all`}
                    />
                  </div>
                  {formErrors.phoneNumber && (
                    <p className="text-red-600 text-xs text-right">{formErrors.phoneNumber}</p>
                  )}
                </div>
              </>
            )}

            {/* Password Field */}
            <div className="space-y-1">
              <div className="relative">
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <HiOutlineLockClosed className="text-[#800020]/70" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="رمز عبور"
                  value={formData.password}
                  onChange={handleInputChange}
                  className={`w-full py-3 pr-10 pl-10 rounded-lg border ${formErrors.password ? 'border-red-500 bg-red-50' : 'border-gray-300'} focus:border-[#800020] focus:ring-2 focus:ring-[#800020]/30 text-right placeholder-gray-400 transition-all`}
                />
                <button 
                  type="button"
                  className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500 hover:text-[#800020]"
                  onClick={togglePasswordVisibility}
                >
                  {showPassword ? <HiOutlineEyeSlash /> : <HiOutlineEye />}
                </button>
              </div>
              {formErrors.password && (
                <p className="text-red-600 text-xs text-right">{formErrors.password}</p>
              )}
            </div>

            {!isLogin && (
              <div className="space-y-1">
                <div className="relative">
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <HiOutlineLockClosed className="text-[#800020]/70" />
                  </div>
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    placeholder="تکرار رمز عبور"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className={`w-full py-3 pr-10 pl-10 rounded-lg border ${formErrors.confirmPassword ? 'border-red-500 bg-red-50' : 'border-gray-300'} focus:border-[#800020] focus:ring-2 focus:ring-[#800020]/30 text-right placeholder-gray-400 transition-all`}
                  />
                  <button 
                    type="button"
                    className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500 hover:text-[#800020]"
                    onClick={toggleConfirmPasswordVisibility}
                  >
                    {showConfirmPassword ? <HiOutlineEyeSlash /> : <HiOutlineEye />}
                  </button>
                </div>
                {formErrors.confirmPassword && (
                  <p className="text-red-600 text-xs text-right">{formErrors.confirmPassword}</p>
                )}
              </div>
            )}

            {isLogin && (
              <div className="text-right">
                <a href="#" className="text-[#800020] hover:text-[#4A0E2A] text-sm transition-colors">
                  فراموشی رمز عبور؟
                </a>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full bg-[#800020] hover:bg-[#4A0E2A] text-white py-3 rounded-lg transition-colors duration-300 font-bold relative overflow-hidden ${isLoading ? 'opacity-90 cursor-wait' : ''}`}
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
          </form>

          <div className="text-center mt-6">
            <p className="text-gray-600 text-sm">
              {isLogin ? 'حساب کاربری ندارید؟' : 'قبلاً ثبت نام کرده‌اید؟'}
              <button 
                onClick={() => setIsLogin(!isLogin)} 
                className="mr-2 text-[#800020] hover:text-[#4A0E2A] font-bold transition-colors"
              >
                {isLogin ? 'ثبت نام' : 'ورود'}
              </button>
            </p>
          </div>
          
          {/* Social login options */}
          {isLogin && (
            <div className="mt-8">
              <div className="relative flex items-center">
                <div className="flex-grow border-t border-gray-300"></div>
                <span className="flex-shrink mx-4 text-gray-400 text-sm">یا ورود با</span>
                <div className="flex-grow border-t border-gray-300"></div>
              </div>
              
              <div className="flex justify-center space-x-4 mt-4">
                <button className="flex items-center justify-center w-12 h-12 rounded-full border border-gray-300 hover:bg-gray-50 transition-colors">
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#DB4437" d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"></path>
                  </svg>
                </button>
                
                <button className="flex items-center justify-center w-12 h-12 rounded-full border border-gray-300 hover:bg-gray-50 transition-colors">
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#1877F2" d="M23.9981 11.9991C23.9981 5.37216 18.626 0 11.9991 0C5.37216 0 0 5.37216 0 11.9991C0 17.9882 4.38789 22.9522 10.1242 23.8524V15.4676H7.07758V11.9991H10.1242V9.35553C10.1242 6.34826 11.9156 4.68714 14.6564 4.68714C15.9692 4.68714 17.3424 4.92149 17.3424 4.92149V7.87439H15.8294C14.3388 7.87439 13.8739 8.79933 13.8739 9.74824V11.9991H17.2018L16.6698 15.4676H13.8739V23.8524C19.6103 22.9522 23.9981 17.9882 23.9981 11.9991Z"></path>
                  </svg>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      
      <div className="mt-6 text-center text-white/80 text-sm">
        © {new Date().getFullYear()} فروشگاه محصولات چرمی. تمامی حقوق محفوظ است.
      </div>
    </div>
  );
};

export default AuthPage;