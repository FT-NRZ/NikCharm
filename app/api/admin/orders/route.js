import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

// GET - دریافت تمام سفارشات برای ادمین
export async function GET(request) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!token) {
      return NextResponse.json({ error: 'توکن یافت نشد' }, { status: 401 });
    }

    // دریافت تمام سفارشات با جزئیات کامل
    const orders = await prisma.orders.findMany({
      include: {
        users: {
          select: {
            full_name: true,
            email: true,
            phone_number: true
          }
        },
        order_items: {
          include: {
            products: {
              include: {
                product_images: true
              }
            }
          }
        }
      },
      orderBy: {
        date: 'desc'
      }
    });

    // فرمت کردن داده‌ها برای frontend
    const formattedOrders = orders.map(order => ({
      id: `#ORD-${order.id.toString().padStart(6, '0')}`,
      orderId: order.id,
      date: new Date(order.date).toLocaleDateString('fa-IR'),
      total: Number(order.totalprice),
      status: order.status,
      delivery_address: order.delivery_address,
      user: {
        full_name: order.users?.full_name,
        email: order.users?.email,
        phone_number: order.users?.phone_number
      },
      items: order.order_items.map(item => ({
        name: item.name,
        price: Number(item.price),
        quantity: item.quantity,
        total_price: Number(item.total_price),
        image: item.products?.product_images?.[0]?.url || '/api/placeholder/80/80'
      }))
    }));

    return NextResponse.json({
      success: true,
      orders: formattedOrders
    });

  } catch (error) {
    console.error('خطا در دریافت سفارشات ادمین:', error);
    return NextResponse.json(
      { error: 'خطا در دریافت سفارشات' },
      { status: 500 }
    );
  }
}