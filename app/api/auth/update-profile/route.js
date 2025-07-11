// app/api/auth/update-profile/route.js
import { NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import { prisma } from '../../../../lib/prisma'

const JWT_SECRET = process.env.JWT_SECRET || 'nikcharm-secret-key-2024'

export async function PUT(request) {
  try {
    const authHeader = request.headers.get('authorization')
    const token = authHeader && authHeader.split(' ')[1]

    if (!token) {
      return NextResponse.json({
        success: false,
        message: 'Token required'
      }, { status: 401 })
    }

    // تأیید token
    const decoded = jwt.verify(token, JWT_SECRET)
    
    // دریافت داده‌های جدید از body
    const { fullName, email, phoneNumber } = await request.json()

    // بررسی اینکه کاربر وجود دارد
    const existingUser = await prisma.users.findUnique({
      where: { id: decoded.userId }
    })

    if (!existingUser || !existingUser.isactive) {
      return NextResponse.json({
        success: false,
        message: 'کاربر یافت نشد'
      }, { status: 404 })
    }

    // بررسی یکتایی ایمیل (اگر تغییر کرده)
    if (email && email !== existingUser.email) {
      const emailExists = await prisma.users.findUnique({
        where: { email: email }
      })
      
      if (emailExists) {
        return NextResponse.json({
          success: false,
          message: 'این ایمیل قبلاً استفاده شده است'
        }, { status: 400 })
      }
    }

    // بروزرسانی اطلاعات کاربر
    const updatedUser = await prisma.users.update({
      where: { id: decoded.userId },
      data: {
        full_name: fullName,
        email: email,
        phone_number: phoneNumber,
        updated_at: new Date()
      },
      include: {
        user_roles: {
          include: {
            roles: true
          }
        }
      }
    })

    const userRoles = updatedUser.user_roles.map(ur => ur.roles.name)

    return NextResponse.json({
      success: true,
      message: 'پروفایل با موفقیت بروزرسانی شد',
      user: {
        id: updatedUser.id,
        username: updatedUser.username,
        email: updatedUser.email,
        fullName: updatedUser.full_name,
        phoneNumber: updatedUser.phone_number,
        role: decoded.role,
        roles: userRoles
      }
    })

  } catch (error) {
    console.error('خطا در بروزرسانی پروفایل:', error)
    
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return NextResponse.json({
        success: false,
        message: 'Token نامعتبر'
      }, { status: 401 })
    }

    return NextResponse.json({
      success: false,
      message: 'خطا در بروزرسانی پروفایل'
    }, { status: 500 })
    }
}