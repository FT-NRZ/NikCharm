// app/api/addresses/[id]/route.js - ایجاد کنید:

import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const JWT_SECRET = process.env.JWT_SECRET || 'nikcharm-secret-key-2024';

export async function DELETE(request, { params }) {
  try {
    console.log('🗑️ شروع حذف آدرس:', params.id);
    
    const authorization = request.headers.get('authorization');
    
    if (!authorization || !authorization.startsWith('Bearer ')) {
      return NextResponse.json({
        success: false,
        message: 'لطفا وارد حساب کاربری خود شوید'
      }, { status: 401 });
    }

    const token = authorization.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);
    const userId = decoded.userId || decoded.id;

    const addressId = parseInt(params.id);

    // بررسی مالکیت آدرس
    const address = await prisma.address.findFirst({
      where: {
        id: addressId,
        user_id: parseInt(userId)
      }
    });

    if (!address) {
      console.log('❌ آدرس یافت نشد یا متعلق به کاربر نیست');
      return NextResponse.json({
        success: false,
        error: 'آدرس یافت نشد یا متعلق به شما نیست'
      }, { status: 404 });
    }

    // حذف آدرس
    await prisma.address.delete({
      where: {
        id: addressId
      }
    });

    console.log('✅ آدرس با موفقیت حذف شد');

    return NextResponse.json({
      success: true,
      message: 'آدرس با موفقیت حذف شد'
    });

  } catch (error) {
    console.error('❌ خطا در حذف آدرس:', error);
    return NextResponse.json({
      success: false,
      error: 'خطای سرور در حذف آدرس',
      message: error.message
    }, { status: 500 });
  }
}