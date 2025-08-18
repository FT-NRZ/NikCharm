import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

export async function POST(request) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: 'توکن یافت نشد' }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.userId || decoded.id;

    const { orderId, status } = await request.json();
    const orderIdNumber = parseInt(orderId);

    // بررسی اینکه سفارش متعلق به کاربر است
    const order = await prisma.orders.findUnique({
      where: { id: orderIdNumber },
    });

    if (!order || order.user_id !== userId) {
      return NextResponse.json({ error: 'سفارش یافت نشد' }, { status: 404 });
    }

    // به‌روزرسانی وضعیت سفارش
    await prisma.orders.update({
      where: { id: orderIdNumber },
      data: { status: status },
    });

    return NextResponse.json({ success: true, message: 'وضعیت سفارش تغییر کرد' });

  } catch (error) {
    console.error('❌ خطا در تغییر وضعیت:', error);
    return NextResponse.json({ error: 'خطا در تغییر وضعیت' }, { status: 500 });
  }
}