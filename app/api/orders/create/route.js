// app/api/orders/create/route.js - فایل جداگانه برای checkout ایجاد کن:
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

    const { items, total_amount, delivery_address, phone_number, address_id } = await request.json();

    // ایجاد سفارش جدید
    const newOrder = await prisma.orders.create({
      data: {
        user_id: userId,
        delivery_address: delivery_address,
        totalprice: total_amount,
        numberoforders: items.length,
        status: 'pending',
        date: new Date(),
        phone_number: phone_number
      }
    });

    // ایجاد آیتم‌های سفارش
    const orderItems = await Promise.all(
      items.map(item => 
        prisma.order_items.create({
          data: {
            order_id: newOrder.id,
            product_id: item.product_id,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            total_price: item.price * item.quantity
          }
        })
      )
    );

    return NextResponse.json({
      success: true,
      order: {
        id: newOrder.id,
        order_number: `#ORD-${newOrder.id.toString().padStart(6, '0')}`,
        total: Number(newOrder.totalprice)
      },
      message: 'سفارش با موفقیت ثبت شد'
    });

  } catch (error) {
    console.error('خطا در ایجاد سفارش:', error);
    return NextResponse.json(
      { error: 'خطا در ایجاد سفارش' },
      { status: 500 }
    );
  }
}