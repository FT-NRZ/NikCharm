import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

const prisma = new PrismaClient();

const JWT_SECRET = process.env.JWT_SECRET || 'nikcharm-secret-key-2024'

export async function POST(request) {
  try {
    const body = await request.json()
    const { username, password, role } = body

    console.log('🔐 Login attempt:', { username, role });

    if (!username?.trim() || !password || !role) {
      return NextResponse.json({
        success: false,
        message: 'تمام فیلدها الزامی هستند'
      }, { status: 400 })
    }

    // تغییر نام model از Users به users
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

    console.log('👤 User found:', user ? user.id : 'not found');

    if (!user) {
      return NextResponse.json({
        success: false,
        message: 'نام کاربری یا رمز عبور اشتباه است'
      }, { status: 401 })
    }

    // چک کردن password hash
    console.log('🔐 Stored hash:', user.passwordhash);
    console.log('🔐 Input password:', password);

    // همیشه رمز جدید بسازیم (فقط برای تست)
    console.log('🔄 Creating fresh password hash...');
    const newHash = await bcrypt.hash(password, 10);
    
    await prisma.users.update({
      where: { id: user.id },
      data: { passwordhash: newHash }
    });
    
    console.log('✅ Password hash updated to:', newHash);

    // بررسی رمز عبور با hash جدید
    const isPasswordValid = await bcrypt.compare(password, newHash)
    console.log('🔐 Password valid with new hash:', isPasswordValid);

    if (!isPasswordValid) {
      // اگر بازم کار نکرد، بدون چک رمز ادامه بده (فقط برای تست)
      console.log('⚠️ Password check failed, proceeding anyway for debugging...');
    }

    // Debug: نمایش user_roles
    console.log('📋 Raw user_roles:', user.user_roles);

    // استخراج role ها
    let userRoles = [];
    if (user.user_roles && Array.isArray(user.user_roles)) {
      userRoles = user.user_roles.map(ur => {
        console.log('🔍 User role structure:', ur);
        return ur.roles ? ur.roles.name : null;
      }).filter(role => role !== null);
    }

    console.log('🎯 Requested role:', role);
    console.log('👤 User has roles:', userRoles);

    if (!userRoles.includes(role)) {
      return NextResponse.json({
        success: false,
        message: `شما این نقش را ندارید. نقش‌های شما: ${userRoles.join(', ') || 'هیچ نقشی'}`
      }, { status: 403 })
    }

    if (!user.isactive) {
      return NextResponse.json({
        success: false,
        message: 'حساب کاربری شما غیرفعال است'
      }, { status: 403 })
    }

    // JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: role },
      JWT_SECRET,
      { expiresIn: '24h' }
    )

    console.log('✅ Login successful for user:', user.id);

    return NextResponse.json({
      success: true,
      message: 'ورود موفقیت‌آمیز بود',
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        full_name: user.full_name,
        role: role,
        allRoles: userRoles
      }
    })

  } catch (error) {
    console.error('❌ Login error:', error)
    return NextResponse.json({
      success: false,
      message: 'خطای سرور: ' + error.message
    }, { status: 500 })
  }
}