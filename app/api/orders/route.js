// app/api/orders/route.js - کد کامل:
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

// POST - برای ایجاد سفارش جدید (کد موجود شما)
export async function POST(request) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return NextResponse.json({ error: 'توکن یافت نشد' }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.userId || decoded.id;

    const data = await request.json();
    
    // ایجاد سفارش جدید
    const newOrder = await prisma.orders.create({
      data: {
        user_id: userId,
        total_amount: data.totalprice,
        status: 'pending',
        delivery_address: data.delivery_address,
        phone_number: data.phone_number,
        // اضافه کردن سایر فیلدهای مورد نیاز
      },
    });

    return NextResponse.json({
      success: true,
      order: newOrder,
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

// GET - برای دریافت لیست سفارشات (برای صفحه orders)
export async function GET(request) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return NextResponse.json({ error: 'توکن یافت نشد' }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.userId || decoded.id;

    // دریافت سفارشات با جزئیات کامل
    const orders = await prisma.orders.findMany({
      where: {
        user_id: userId
      },
      include: {
        order_items: {
          include: {
            products: {
              include: {
                product_images: true
              }
            }
          }
        },
        payments: {
          include: {
            payment_gateways: true
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
      statusText: getStatusText(order.status),
      delivery_address: order.delivery_address,
      payment_status: order.payments[0]?.status || 'pending',
      payment_gateway: order.payments[0]?.payment_gateways?.gatewayname || null,
      transaction_id: order.payments[0]?.transactionid || null,
      items: order.order_items.map(item => ({
        name: item.name,
        price: Number(item.price),
        quantity: item.quantity,
        total_price: Number(item.total_price),
        image: item.products?.product_images?.[0]?.url || '/api/placeholder/80/80',
        product: {
          id: item.products?.id,
          name: item.products?.name,
          material: item.products?.material,
          color: item.products?.color
        }
      }))
    }));

    return NextResponse.json({
      success: true,
      orders: formattedOrders
    });

  } catch (error) {
    console.error('خطا در دریافت سفارشات:', error);
    return NextResponse.json(
      { error: 'خطا در دریافت سفارشات' },
      { status: 500 }
    );
  }
}

function getStatusText(status) {
  const statusMap = {
    'pending': 'در انتظار پرداخت',
    'paid': 'پرداخت شده',
    'processing': 'در حال پردازش',
    'shipped': 'در حال ارسال',
    'delivered': 'تحویل داده شده',
    'cancelled': 'لغو شده',
    'refunded': 'مرجوع شده'
  };
  return statusMap[status] || 'نامشخص';
}