import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

export async function POST(request) {
  console.log('🚀 شروع درخواست لغو سفارش');
  
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      console.log('❌ توکن یافت نشد');
      return NextResponse.json({ error: 'توکن یافت نشد' }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.userId || decoded.id;
    console.log('👤 کاربر شناسایی شد:', userId);

    const { orderId } = await request.json();
    console.log('📋 orderId دریافت شده:', orderId, 'نوع:', typeof orderId);

    // تبدیل orderId به عدد صحیح اگر string است
    const orderIdNumber = parseInt(orderId);
    console.log('🔢 orderId تبدیل شده:', orderIdNumber);

    // بررسی اینکه سفارش متعلق به کاربر است
    const order = await prisma.orders.findUnique({
      where: { id: orderIdNumber },
    });

    console.log('🔍 سفارش یافت شده:', order);

    if (!order) {
      console.log('❌ سفارش یافت نشد');
      return NextResponse.json({ error: 'سفارش یافت نشد' }, { status: 404 });
    }

    if (order.user_id !== userId) {
      console.log('❌ سفارش متعلق به کاربر نیست');
      return NextResponse.json({ error: 'این سفارش متعلق به شما نیست' }, { status: 403 });
    }

    // بررسی وضعیت فعلی سفارش
    if (order.status === 'cancelled') {
      console.log('⚠️ سفارش قبلاً لغو شده');
      return NextResponse.json({ error: 'این سفارش قبلاً لغو شده است' }, { status: 400 });
    }

    // به‌روزرسانی وضعیت سفارش به "لغو شده"
    console.log('💾 در حال به‌روزرسانی وضعیت سفارش...');
    const updatedOrder = await prisma.orders.update({
      where: { id: orderIdNumber },
      data: { status: 'cancelled' },
    });

    console.log('✅ سفارش لغو شد:', updatedOrder);
    return NextResponse.json({ success: true, message: 'سفارش با موفقیت لغو شد' });

  } catch (error) {
    console.error('❌ خطا در لغو سفارش:', error);
    console.error('❌ نوع خطا:', error.constructor.name);
    console.error('❌ پیام خطا:', error.message);
    
    return NextResponse.json({ 
      error: 'خطا در لغو سفارش',
      details: error.message 
    }, { status: 500 });
  }
}