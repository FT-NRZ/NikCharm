import { NextResponse } from 'next/server'
import prisma from '../../../../lib/prisma'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'nikcharm-secret-key-2024'

export async function POST(request) {
  try {
    const body = await request.json()
    const { username, email, password, confirmPassword, phoneNumber, role } = body

    console.log('📝 Register attempt:', { username, email, role });

    // اعتبارسنجی
    if (!username?.trim() || !email?.trim() || !password?.trim()) {
      return NextResponse.json({
        success: false,
        message: 'تمام فیلدها الزامی هستند'
      }, { status: 400 })
    }

    if (password !== confirmPassword) {
      return NextResponse.json({
        success: false,
        message: 'رمز عبور و تکرار آن مطابقت ندارند'
      }, { status: 400 })
    }

    if (password.length < 6) {
      return NextResponse.json({
        success: false,
        message: 'رمز عبور باید حداقل 6 کاراکتر باشد'
      }, { status: 400 })
    }

    // بررسی تکراری بودن
    const existingUser = await prisma.users.findFirst({
      where: {
        OR: [
          { email: email.trim().toLowerCase() },
          { username: username.trim().toLowerCase() }
        ]
      }
    })

    if (existingUser) {
      return NextResponse.json({
        success: false,
        message: 'کاربری با این ایمیل یا نام کاربری قبلاً ثبت شده است'
      }, { status: 400 })
    }

    // hash رمز عبور
    const hashedPassword = await bcrypt.hash(password, 10)

    // ایجاد کاربر
    const newUser = await prisma.users.create({
      data: {
        username: username.trim().toLowerCase(),
        email: email.trim().toLowerCase(),
        passwordhash: hashedPassword,
        full_name: username.trim(),
        phone_number: phoneNumber?.trim() || null,
        isactive: true
      }
    })

    // تنظیم role
    const defaultRole = role || 'customer'
    
    try {
      let roleRecord = await prisma.roles.findFirst({
        where: { name: defaultRole }
      })

      if (!roleRecord) {
        roleRecord = await prisma.roles.create({
          data: { name: defaultRole }
        })
      }

      // ⭐ اصلاح نام فیلدها
      await prisma.user_roles.create({
        data: {
          userid: newUser.id,    // مطابق schema
          roleid: roleRecord.id  // مطابق schema
        }
      })
    } catch (roleError) {
      console.error('⚠️ Role assignment failed:', roleError);
    }

    // JWT token
    const token = jwt.sign(
      { userId: newUser.id, email: newUser.email, role: defaultRole },
      JWT_SECRET,
      { expiresIn: '24h' }
    )

    return NextResponse.json({
      success: true,
      message: 'ثبت‌نام با موفقیت انجام شد',
      token,
      user: {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
        fullName: newUser.full_name,
        role: defaultRole
      }
    })

  } catch (error) {
    console.error('❌ Registration error:', error)
    return NextResponse.json({
      success: false,
      message: 'خطا در ثبت‌نام: ' + error.message
    }, { status: 500 })
  }
}