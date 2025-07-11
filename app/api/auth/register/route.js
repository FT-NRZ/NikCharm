import { NextResponse } from 'next/server'
import { prisma } from '../../../../lib/prisma'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'nikcharm-secret-key-2024'

export async function POST(request) {
  try {
    const body = await request.json()
    const { 
      username, 
      email, 
      password, 
      confirmPassword,
      phoneNumber, 
      role 
    } = body

    // اعتبارسنجی
    if (!username?.trim()) {
      return NextResponse.json({
        success: false,
        message: 'نام کاربری الزامی است'
      }, { status: 400 })
    }

    if (!email?.trim()) {
      return NextResponse.json({
        success: false,
        message: 'ایمیل الزامی است'
      }, { status: 400 })
    }

    if (!password || password.length < 8) {
      return NextResponse.json({
        success: false,
        message: 'رمز عبور باید حداقل 8 کاراکتر باشد'
      }, { status: 400 })
    }

    if (password !== confirmPassword) {
      return NextResponse.json({
        success: false,
        message: 'رمز عبور و تکرار آن مطابقت ندارند'
      }, { status: 400 })
    }

    if (!role || !['admin', 'customer'].includes(role)) {
      return NextResponse.json({
        success: false,
        message: 'نقش کاربری معتبر نیست'
      }, { status: 400 })
    }

    // بررسی تکراری نبودن
    const existingUser = await prisma.users.findFirst({
      where: {
        OR: [
          { username: username.trim().toLowerCase() },
          { email: email.trim().toLowerCase() }
        ]
      }
    })

    if (existingUser) {
      return NextResponse.json({
        success: false,
        message: 'این نام کاربری یا ایمیل قبلاً ثبت شده است'
      }, { status: 400 })
    }

    // ایجاد نقش اگر وجود ندارد
    let userRole = await prisma.roles.findFirst({
      where: { name: role }
    })

    if (!userRole) {
      userRole = await prisma.roles.create({
        data: { name: role }
      })
    }

    // Hash رمز عبور
    const hashedPassword = await bcrypt.hash(password, 12)

    // ایجاد کاربر
    const newUser = await prisma.users.create({
      data: {
        username: username.trim().toLowerCase(),
        email: email.trim().toLowerCase(),
        full_name: username.trim(),
        passwordhash: hashedPassword,
        phone_number: phoneNumber?.trim(),
        isactive: true
      }
    })

    // تخصیص نقش
    await prisma.user_roles.create({
      data: {
        userid: newUser.id,
        roleid: userRole.id
      }
    })

    // تولید Token
    const token = jwt.sign(
      { 
        userId: newUser.id, 
        username: newUser.username,
        email: newUser.email,
        role: role
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    )

    // ثبت رکورد ورود
    await prisma.login_records.create({
      data: {
        user_id: newUser.id,
        token: token,
        expirationdate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      }
    })

    return NextResponse.json({
      success: true,
      message: 'حساب کاربری با موفقیت ایجاد شد',
      token: token,
      user: {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
        fullName: newUser.full_name,
        role: role
      }
    }, { status: 201 })

  } catch (error) {
    console.error('خطا در ثبت‌نام:', error)
    
    return NextResponse.json({
      success: false,
      message: 'خطا در ایجاد حساب کاربری'
    }, { status: 500 })
  }
}