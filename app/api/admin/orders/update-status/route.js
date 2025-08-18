import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

// PUT - تغییر وضعیت سفارش توسط ادمین
export async function PUT(request) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return NextResponse.json({ error: 'توکن یافت نشد' }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const { orderId, status } = await request.json();

    // بررسی وجود سفارش
    const order = await prisma.orders.findUnique({
      where: { id: parseInt(orderId) }
    });

    if (!order) {
      return NextResponse.json({ error: 'سفارش یافت نشد' }, { status: 404 });
    }

    // تغییر وضعیت سفارش
    const updatedOrder = await prisma.orders.update({
      where: { id: parseInt(orderId) },
      data: { status: status }
    });

    return NextResponse.json({
      success: true,
      message: 'وضعیت سفارش تغییر کرد',
      order: updatedOrder
    });

  } catch (error) {
    console.error('خطا در تغییر وضعیت سفارش:', error);
    return NextResponse.json(
      { error: 'خطا در تغییر وضعیت سفارش' },
      { status: 500 }
    );
  }
}