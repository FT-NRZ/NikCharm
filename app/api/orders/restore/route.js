import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

export async function POST(request) {
  console.log('🚀 شروع درخواست بازگردانی سفارش');
  
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
    console.log('📋 orderId دریافت شده:', orderId);

    const orderIdNumber = parseInt(orderId);

    // بررسی اینکه سفارش متعلق به کاربر است و لغو شده
    const order = await prisma.orders.findUnique({
      where: { id: orderIdNumber },
    });

    if (!order) {
      return NextResponse.json({ error: 'سفارش یافت نشد' }, { status: 404 });
    }

    if (order.user_id !== userId) {
      return NextResponse.json({ error: 'این سفارش متعلق به شما نیست' }, { status: 403 });
    }

    if (order.status !== 'cancelled') {
      return NextResponse.json({ error: 'فقط سفارشات لغو شده قابل بازگردانی هستند' }, { status: 400 });
    }

    // به‌روزرسانی وضعیت سفارش به "در انتظار پرداخت"
    const updatedOrder = await prisma.orders.update({
      where: { id: orderIdNumber },
      data: { status: 'pending' },
    });

    console.log('✅ سفارش بازگردانی شد:', updatedOrder);
    return NextResponse.json({ success: true, message: 'سفارش با موفقیت بازگردانی شد' });

  } catch (error) {
    console.error('❌ خطا در بازگردانی سفارش:', error);
    return NextResponse.json({ 
      error: 'خطا در بازگردانی سفارش',
      details: error.message 
    }, { status: 500 });
  }
}