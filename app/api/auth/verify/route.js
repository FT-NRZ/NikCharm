import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import prisma from '../../../../lib/prisma';

const JWT_SECRET = process.env.JWT_SECRET || 'nikcharm-secret-key-2024';

export async function POST(request) {
  try {
    const body = await request.json();
    const { token } = body;

    console.log('🔐 Token verification attempt');

    if (!token) {
      return NextResponse.json({
        success: false,
        message: 'توکن الزامی است'
      }, { status: 400 });
    }

    // تایید توکن
    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (jwtError) {
      console.log('❌ Invalid token:', jwtError.message);
      return NextResponse.json({
        success: false,
        message: 'توکن نامعتبر است'
      }, { status: 401 });
    }

    // جستجوی کاربر
    const user = await prisma.users.findUnique({
      where: { id: decoded.userId },
      include: {
        user_roles: {
          include: {
            roles: true
          }
        }
      }
    });

    if (!user) {
      return NextResponse.json({
        success: false,
        message: 'کاربر پیدا نشد'
      }, { status: 404 });
    }

    if (!user.isactive) {
      return NextResponse.json({
        success: false,
        message: 'حساب کاربری غیرفعال است'
      }, { status: 403 });
    }

    // استخراج نقش‌ها
    const userRoles = user.user_roles
      .map(ur => ur.roles?.name)
      .filter(role => role !== null);

    return NextResponse.json({
      success: true,
      message: 'توکن معتبر است',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        fullName: user.full_name,
        role: decoded.role,
        allRoles: userRoles
      }
    });

  } catch (error) {
    console.error('❌ Verify error:', error);
    return NextResponse.json({
      success: false,
      message: 'خطای سرور: ' + error.message
    }, { status: 500 });
  }
}