'use client';
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ForgotPasswordModal({ isOpen, onClose }) {
  const [step, setStep] = useState(1); // 1: ایمیل، 2: کد تایید، 3: رمز جدید
  const [email, setEmail] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [timer, setTimer] = useState(0);

  // مرحله 1: ارسال ایمیل
  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    
    if (!email.trim()) {
      setError('ایمیل الزامی است');
      return;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      setError('فرمت ایمیل صحیح نیست');
      return;
    }

    setIsLoading(true);
    setError('');
    setMessage('');
    
    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, step: 'send-code' }),
      });

      const result = await response.json();
      
      if (response.ok) {
        setMessage('کد تایید به ایمیل شما ارسال شد');
        setStep(2);
        startTimer();
      } else {
        setError(result.message || 'خطا در ارسال کد تایید');
      }
    } catch (error) {
      console.error('Error:', error);
      setError('خطا در برقراری ارتباط با سرور');
    } finally {
      setIsLoading(false);
    }
  };

  // مرحله 2: تایید کد
  const handleCodeVerification = async (e) => {
    e.preventDefault();
    
    if (!verificationCode.trim()) {
      setError('کد تایید الزامی است');
      return;
    }

    if (verificationCode.length !== 6) {
      setError('کد تایید باید 6 رقم باشد');
      return;
    }

    setIsLoading(true);
    setError('');
    setMessage('');
    
    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          email, 
          code: verificationCode,
          step: 'verify-code'
        }),
      });

      const result = await response.json();
      
      if (response.ok) {
        setMessage('کد تایید شد. رمز جدید خود را وارد کنید');
        setStep(3);
      } else {
        setError(result.message || 'کد تایید نادرست است');
      }
    } catch (error) {
      console.error('Error:', error);
      setError('خطا در برقراری ارتباط با سرور');
    } finally {
      setIsLoading(false);
    }
  };

  // مرحله 3: تنظیم رمز جدید
  const handlePasswordReset = async (e) => {
    e.preventDefault();
    
    if (!newPassword.trim()) {
      setError('رمز عبور جدید الزامی است');
      return;
    }

    if (newPassword.length < 6) {
      setError('رمز عبور باید حداقل 6 کاراکتر باشد');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('تکرار رمز عبور مطابقت ندارد');
      return;
    }

    setIsLoading(true);
    setError('');
    setMessage('');
    
    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          email, 
          code: verificationCode,
          newPassword,
          step: 'reset-password'
        }),
      });

      const result = await response.json();
      
      if (response.ok) {
        setMessage('رمز عبور با موفقیت تغییر کرد');
        setTimeout(() => {
          handleClose();
        }, 2000);
      } else {
        setError(result.message || 'خطا در تغییر رمز عبور');
      }
    } catch (error) {
      console.error('Error:', error);
      setError('خطا در برقراری ارتباط با سرور');
    } finally {
      setIsLoading(false);
    }
  };

  // تایمر برای ارسال مجدد کد
  const startTimer = () => {
    setTimer(120); // 2 دقیقه
    const interval = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // ارسال مجدد کد
  const handleResendCode = () => {
    if (timer > 0) return;
    handleEmailSubmit({ preventDefault: () => {} });
  };

  const handleClose = () => {
    setStep(1);
    setEmail('');
    setVerificationCode('');
    setNewPassword('');
    setConfirmPassword('');
    setMessage('');
    setError('');
    setTimer(0);
    onClose();
  };

  // برگشت به مرحله قبل
  const handleBackStep = () => {
    if (step > 1) {
      setStep(step - 1);
      setError('');
      setMessage('');
    }
  };

  if (!isOpen) return null;

  const formatTimer = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 relative"
        style={{ fontFamily: 'Vazirmatn, system-ui, sans-serif', direction: 'rtl' }}
      >
        <button
          onClick={handleClose}
          className="absolute top-4 left-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* نشانگر مراحل */}
        <div className="flex justify-center mb-6">
          <div className="flex items-center space-x-2 space-x-reverse">
            {[1, 2, 3].map((stepNum) => (
              <React.Fragment key={stepNum}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                  step >= stepNum 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-200 text-gray-500'
                }`}>
                  {stepNum}
                </div>
                {stepNum < 3 && (
                  <div className={`w-12 h-1 ${
                    step > stepNum ? 'bg-blue-600' : 'bg-gray-200'
                  }`} />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        <div className="text-center mb-6">
          <div className="mx-auto mb-4 w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
            <svg className="h-8 w-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">
            {step === 1 && 'بازیابی رمز عبور'}
            {step === 2 && 'تایید کد ایمیل'}
            {step === 3 && 'رمز عبور جدید'}
          </h3>
          <p className="text-gray-600 text-sm">
            {step === 1 && 'ایمیل خود را وارد کنید تا کد تایید برای شما ارسال شود'}
            {step === 2 && 'کد 6 رقمی ارسال شده به ایمیل خود را وارد کنید'}
            {step === 3 && 'رمز عبور جدید خود را انتخاب کنید'}
          </p>
        </div>

        <AnimatePresence mode="wait">
          {error && (
            <motion.div
              key="error-message"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-center text-sm mb-4"
            >
              {error}
            </motion.div>
          )}
          
          {message && (
            <motion.div
              key="success-message"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl text-center text-sm mb-4"
            >
              {message}
            </motion.div>
          )}
        </AnimatePresence>

        {/* مرحله 1: وارد کردن ایمیل */}
        {step === 1 && (
          <form onSubmit={handleEmailSubmit} className="space-y-4">
            <div className="relative">
              <svg className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ایمیل شما"
                className="w-full py-3 pr-10 pl-4 border border-gray-300 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                disabled={isLoading}
              />
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={handleClose}
                className="flex-1 py-3 px-4 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium"
                disabled={isLoading}
              >
                انصراف
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-xl font-medium hover:bg-blue-700 transition-colors disabled:opacity-70 flex items-center justify-center"
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    در حال ارسال...
                  </>
                ) : (
                  'ارسال کد تایید'
                )}
              </button>
            </div>
          </form>
        )}

        {/* مرحله 2: وارد کردن کد تایید */}
        {step === 2 && (
          <form onSubmit={handleCodeVerification} className="space-y-4">
            <div className="relative">
              <svg className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <input
                type="text"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="کد 6 رقمی"
                className="w-full py-3 pr-10 pl-4 border border-gray-300 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all text-center text-lg tracking-widest"
                disabled={isLoading}
                maxLength={6}
              />
            </div>

            {/* تایمر و ارسال مجدد */}
            <div className="text-center">
              {timer > 0 ? (
                <p className="text-sm text-gray-500">
                  ارسال مجدد کد تا {formatTimer(timer)} دیگر
                </p>
              ) : (
                <button
                  type="button"
                  onClick={handleResendCode}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                  disabled={isLoading}
                >
                  ارسال مجدد کد تایید
                </button>
              )}
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={handleBackStep}
                className="flex-1 py-3 px-4 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium"
                disabled={isLoading}
              >
                بازگشت
              </button>
              <button
                type="submit"
                disabled={isLoading || verificationCode.length !== 6}
                className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-xl font-medium hover:bg-blue-700 transition-colors disabled:opacity-70 flex items-center justify-center"
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    در حال تایید...
                  </>
                ) : (
                  'تایید کد'
                )}
              </button>
            </div>
          </form>
        )}

        {/* مرحله 3: تنظیم رمز جدید */}
        {step === 3 && (
          <form onSubmit={handlePasswordReset} className="space-y-4">
            <div className="relative">
              <svg className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="رمز عبور جدید"
                className="w-full py-3 pr-10 pl-4 border border-gray-300 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                disabled={isLoading}
              />
            </div>

            <div className="relative">
              <svg className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="تکرار رمز عبور جدید"
                className="w-full py-3 pr-10 pl-4 border border-gray-300 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                disabled={isLoading}
              />
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={handleBackStep}
                className="flex-1 py-3 px-4 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium"
                disabled={isLoading}
              >
                بازگشت
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-xl font-medium hover:bg-blue-700 transition-colors disabled:opacity-70 flex items-center justify-center"
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    در حال تغییر...
                  </>
                ) : (
                  'تغییر رمز عبور'
                )}
              </button>
            </div>
          </form>
        )}
      </motion.div>
    </div>
  );
}