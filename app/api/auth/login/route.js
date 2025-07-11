import { NextResponse } from 'next/server'
import { prisma } from '../../../../lib/prisma'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'nikcharm-secret-key-2024'

export async function POST(request) {
  try {
    const body = await request.json()
    const { username, password, role } = body

    if (!username?.trim() || !password || !role) {
      return NextResponse.json({
        success: false,
        message: 'تمام فیلدها الزامی هستند'
      }, { status: 400 })
    }

    // جستجوی کاربر
    const user = await prisma.users.findFirst({
      where: {
        OR: [
          { username: username.trim().toLowerCase() },
          { email: username.trim().toLowerCase() }
        ]
      },
      include: {
        user_roles: {
          include: {
            roles: true
          }
        }
      }
    })

    if (!user) {
      return NextResponse.json({
        success: false,
        message: 'نام کاربری یا رمز عبور اشتباه است'
      }, { status: 401 })
    }

    // بررسی رمز عبور
    const isPasswordValid = await bcrypt.compare(password, user.passwordhash)
    
    if (!isPasswordValid) {
      return NextResponse.json({
        success: false,
        message: 'نام کاربری یا رمز عبور اشتباه است'
      }, { status: 401 })
    }

    // بررسی نقش
    const userRoles = user.user_roles.map(ur => ur.roles.name)
    
    if (!userRoles.includes(role)) {
      return NextResponse.json({
        success: false,
        message: 'شما این نقش را ندارید'
      }, { status: 403 })
    }

    // تولید Token
    const token = jwt.sign(
      { 
        userId: user.id, 
        username: user.username,
        email: user.email,
        role: role
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    )

    // ثبت رکورد ورود
    await prisma.login_records.create({
      data: {
        user_id: user.id,
        token: token,
        expirationdate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 روز آینده
      }
    })

    return NextResponse.json({
      success: true,
      message: 'ورود موفقیت‌آمیز بود',
      token: token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: role
      }
    }, { status: 200 })

  } catch (error) {
    console.error('خطا در ورود:', error)

    return NextResponse.json({
      success: false,
      message: 'خطا در ورود'
    }, { status: 500 })
  }
}
