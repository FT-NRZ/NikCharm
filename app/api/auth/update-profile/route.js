import { NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const JWT_SECRET = process.env.JWT_SECRET || 'nikcharm-secret-key-2024'

export async function PUT(request) {
  try {
    console.log('🔄 شروع بروزرسانی پروفایل...')
    
    const authHeader = request.headers.get('authorization')
    const token = authHeader && authHeader.split(' ')[1]

    if (!token) {
      console.log('❌ Token نیست')
      return NextResponse.json({
        success: false,
        message: 'Token required'
      }, { status: 401 })
    }

    // تأیید token
    const decoded = jwt.verify(token, JWT_SECRET)
    const userId = decoded.userId || decoded.id
    console.log('👤 User ID:', userId)

    // دریافت داده‌های جدید از body
    const body = await request.json()
    console.log('📦 Body data دریافت شده:', body)

    // استخراج داده‌ها
    const {
      fullName,
      email,
      phoneNumber,   // ⭐ از frontend
      phone_number,  // ⭐ احتمالی
      phone          // ⭐ احتمالی
    } = body

    // تشخیص شماره تلفن
    const newPhone = phoneNumber || phone_number || phone
    console.log('📞 شماره تلفن استخراج شده:', newPhone)

    // پیدا کردن کاربر فعلی
    const existingUser = await prisma.users.findUnique({
      where: { id: parseInt(userId) }
    })

    if (!existingUser) {
      return NextResponse.json({
        success: false,
        message: 'کاربر یافت نشد'
      }, { status: 404 })
    }

    console.log('👤 کاربر موجود:', {
      id: existingUser.id,
      email: existingUser.email,
      fields: Object.keys(existingUser)
    })

    // آماده سازی داده‌های بروزرسانی
    const updateData = {}

    // بروزرسانی ایمیل
    if (email && email.trim()) {
      updateData.email = email.trim()
    }

    // بروزرسانی نام
    if (fullName && fullName.trim()) {
      // تست هر دو فیلد احتمالی
      if (existingUser.hasOwnProperty('full_name')) {
        updateData.full_name = fullName.trim()
        console.log('✅ full_name بروزرسانی شد')
      }
      if (existingUser.hasOwnProperty('name')) {
        updateData.name = fullName.trim()
        console.log('✅ name بروزرسانی شد')
      }
    }

    // ⭐ بروزرسانی شماره تلفن (هر دو فیلد)
    if (newPhone && newPhone.trim()) {
      console.log('📞 بروزرسانی شماره تلفن:', newPhone.trim())
      
      // بروزرسانی هر دو فیلد احتمالی
      if (existingUser.hasOwnProperty('phone_number')) {
        updateData.phone_number = newPhone.trim()
        console.log('✅ phone_number بروزرسانی شد')
      }
      if (existingUser.hasOwnProperty('phone')) {
        updateData.phone = newPhone.trim()
        console.log('✅ phone بروزرسانی شد')
      }
    }

    console.log('📝 داده‌های نهایی بروزرسانی:', updateData)

    // اگر هیچ داده‌ای برای بروزرسانی نیست
    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({
        success: false,
        message: 'هیچ تغییری برای بروزرسانی یافت نشد'
      }, { status: 400 })
    }

    // اعمال بروزرسانی
    const updatedUser = await prisma.users.update({
      where: { id: parseInt(userId) },
      data: updateData
    })

    console.log('✅ کاربر بروزرسانی شد:', updatedUser)

    // ⭐ تشخیص فیلد نام و تلفن برای پاسخ
    const responseFullName = updatedUser.full_name || updatedUser.name || ''
    const responsePhone = updatedUser.phone_number || updatedUser.phone || ''

    console.log('📤 پاسخ نهایی:', {
      fullName: responseFullName,
      phoneNumber: responsePhone
    })

    return NextResponse.json({
      success: true,
      message: 'پروفایل با موفقیت بروزرسانی شد',
      user: {
        id: updatedUser.id,
        username: updatedUser.username,
        email: updatedUser.email,
        fullName: responseFullName,        // ⭐ فیلد اصلی
        phoneNumber: responsePhone,        // ⭐ فیلد اصلی
        name: responseFullName,            // ⭐ فیلد جایگزین
        phone: responsePhone,              // ⭐ فیلد جایگزین
        created_at: updatedUser.created_at
      }
    })

  } catch (error) {
    console.error('❌ خطای کلی:', error.message)
    console.error('❌ خطای کلی stack:', error.stack)
    
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return NextResponse.json({
        success: false,
        message: 'Token نامعتبر'
      }, { status: 401 })
    }

    if (error.code === 'P2002') {
      return NextResponse.json({
        success: false,
        message: 'این ایمیل قبلاً استفاده شده است'
      }, { status: 400 })
    }

    return NextResponse.json({
      success: false,
      message: 'خطا در بروزرسانی پروفایل',
      error: error.message
    }, { status: 500 })
  }
}