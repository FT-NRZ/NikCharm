import { NextResponse } from 'next/server';
import prisma from '../../../../lib/prisma';

export async function POST(request) {
  try {
    const { email, role } = await request.json();
    
    console.log('🎯 Assigning role:', { email, role });

    if (!email?.trim() || !role?.trim()) {
      return NextResponse.json({
        success: false,
        message: 'ایمیل و نقش الزامی هستند'
      }, { status: 400 });
    }

    // جستجوی کاربر
    const user = await prisma.users.findUnique({
      where: { email: email.trim().toLowerCase() }
    });

    if (!user) {
      return NextResponse.json({
        success: false,
        message: 'کاربر پیدا نشد'
      }, { status: 404 });
    }

    // جستجو یا ایجاد نقش
    let roleRecord = await prisma.Roles.findFirst({
      where: { name: role }
    });

    if (!roleRecord) {
      roleRecord = await prisma.Roles.create({
        data: { name: role }
      });
    }

    // حذف نقش‌های قبلی
    await prisma.User_roles.deleteMany({
      where: { userid: user.id }
    });

    // تخصیص نقش جدید
    await prisma.User_roles.create({
      data: {
        userid: user.id,
        roleid: roleRecord.id
      }
    });

    console.log('✅ Role assigned successfully');

    return NextResponse.json({
      success: true,
      message: `نقش ${role} به کاربر تخصیص داده شد`,
      user: {
        id: user.id,
        email: user.email,
        role: role
      }
    });

  } catch (error) {
    console.error('❌ Assign role error:', error);
    return NextResponse.json({
      success: false,
      message: 'خطای سرور: ' + error.message
    }, { status: 500 });
  }
}