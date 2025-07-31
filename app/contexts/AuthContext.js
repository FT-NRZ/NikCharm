'use client'
import { createContext, useContext, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  // بررسی وضعیت کاربر هنگام بارگذاری صفحه
  useEffect(() => {
    if (typeof window !== 'undefined') {
      checkAuth()
    }

    // گوش دادن به تغییرات localStorage
    const handleStorageChange = () => {
      console.log('📦 Storage changed, reloading auth data');
      checkAuthFromStorage();
    };

    const handleUserLogin = (event) => {
      console.log('🔐 User login event received:', event.detail);
      setUser(event.detail);
      setLoading(false);
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('userLogin', handleUserLogin);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('userLogin', handleUserLogin);
    };
  }, [])

  const checkAuthFromStorage = () => {
    try {
      const token = localStorage.getItem('token');
      const savedUser = localStorage.getItem('user');
      const isLoggedIn = localStorage.getItem('isLoggedIn');

      if (token && savedUser && isLoggedIn === 'true') {
        const userData = JSON.parse(savedUser);
        console.log('👤 Loading user from localStorage in AuthContext:', userData);
        setUser(userData);
      } else {
        console.log('❌ No valid user data in localStorage');
        setUser(null);
      }
    } catch (error) {
      console.error('Error loading user from localStorage:', error);
      setUser(null);
    }
    setLoading(false);
  };

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('token')
      const savedUser = localStorage.getItem('user')
      const isLoggedIn = localStorage.getItem('isLoggedIn')

      if (!token || !savedUser || isLoggedIn !== 'true') {
        console.log('❌ No auth data found in localStorage');
        setLoading(false)
        return
      }

      // اول از localStorage بارگذاری کن
      try {
        const userData = JSON.parse(savedUser);
        setUser(userData);
        console.log('👤 User loaded from localStorage:', userData);
      } catch (parseError) {
        console.error('Error parsing saved user:', parseError);
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        localStorage.removeItem('isLoggedIn');
        setLoading(false);
        return;
      }

      // سپس تایید کن با سرور
      try {
        const response = await fetch('/api/auth/verify', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ token })
        })

        if (response.ok) {
          const data = await response.json()
          if (data.success) {
            setUser(data.user)
            localStorage.setItem('user', JSON.stringify(data.user))
            console.log('✅ User verified with server:', data.user)
          } else {
            console.log('❌ Server verification failed:', data.message)
            // اگر سرور token را رد کرد، پاک کن
            handleLogoutInternal()
          }
        } else {
          console.log('⚠️ Server verification request failed, keeping localStorage data')
          // اگر سرور در دسترس نیست، از localStorage استفاده کن
        }
      } catch (verifyError) {
        console.log('⚠️ Network error during verification, using localStorage:', verifyError.message)
        // خطای شبکه، از localStorage استفاده کن
      }

    } catch (error) {
      console.error('❌ Auth check error:', error)
      handleLogoutInternal()
    } finally {
      setLoading(false)
    }
  }

  const login = async (credentials) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(credentials)
      })

      const data = await response.json()

      if (data.success) {
        // ذخیره در localStorage
        localStorage.setItem('token', data.token)
        localStorage.setItem('user', JSON.stringify(data.user))
        localStorage.setItem('isLoggedIn', 'true')
        localStorage.setItem('userRole', data.user.role)
        
        // تنظیم state
        setUser(data.user)
        
        // اعلان به کامپوننت‌های دیگر
        window.dispatchEvent(new Event('storage'))
        window.dispatchEvent(new CustomEvent('userLogin', { detail: data.user }))
        
        console.log('✅ Login successful in AuthContext:', data.user)
        return { success: true, message: data.message }
      } else {
        return { success: false, message: data.message }
      }
    } catch (error) {
      console.error('خطا در ورود:', error)
      return { success: false, message: 'خطا در ورود به سرور' }
    }
  }

  const register = async (userData) => {
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(userData)
      })

      const data = await response.json()

      if (data.success) {
        // ذخیره در localStorage
        localStorage.setItem('token', data.token)
        localStorage.setItem('user', JSON.stringify(data.user))
        localStorage.setItem('isLoggedIn', 'true')
        localStorage.setItem('userRole', data.user.role)
        
        // تنظیم state
        setUser(data.user)
        
        // اعلان به کامپوننت‌های دیگر
        window.dispatchEvent(new Event('storage'))
        window.dispatchEvent(new CustomEvent('userLogin', { detail: data.user }))
        
        console.log('✅ Registration successful in AuthContext:', data.user)
        return { success: true, message: data.message }
      } else {
        return { success: false, message: data.message }
      }
    } catch (error) {
      console.error('خطا در ثبت‌نام:', error)
      return { success: false, message: 'خطا در ثبت‌نام' }
    }
  }

  const handleLogoutInternal = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    localStorage.removeItem('isLoggedIn')
    localStorage.removeItem('userRole')
    setUser(null)
    
    // اعلان logout
    window.dispatchEvent(new Event('storage'))
    
    console.log('🚪 User logged out from AuthContext')
  }

  const logout = async () => {
    try {
      const token = localStorage.getItem('token')
      if (token) {
        // فراخوانی API برای logout (اختیاری)
        try {
          await fetch('/api/auth/logout', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          })
        } catch (logoutError) {
          console.log('⚠️ Logout API call failed, continuing with local logout')
        }
      }
    } catch (error) {
      console.error('خطا در خروج:', error)
    } finally {
      handleLogoutInternal()
      router.push('/')
    }
  }

  const updateUser = (userData) => {
    const updatedUser = { ...user, ...userData }
    setUser(updatedUser)
    
    // بروزرسانی localStorage
    localStorage.setItem('user', JSON.stringify(updatedUser))
    
    console.log('👤 User updated:', updatedUser)
  }

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    updateUser,
    isAuthenticated: !!user,
    checkAuth: checkAuthFromStorage
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export default AuthProvider