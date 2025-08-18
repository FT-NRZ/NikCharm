import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

export async function POST(request) {
  console.log('🚀 شروع درخواست ایجاد سفارش');
  
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    console.log('🔑 توکن دریافت شده:', token ? 'موجود' : 'نامعلوم');
    
    if (!token) {
      console.log('❌ توکن یافت نشد');
      return NextResponse.json({ error: 'توکن یافت نشد' }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.userId || decoded.id;
    console.log('👤 کاربر شناسایی شد:', userId);

    const requestBody = await request.json();
    console.log('📋 داده‌های دریافتی کامل:', JSON.stringify(requestBody, null, 2));
    
    const { items, totalprice, delivery_address } = requestBody;

    console.log('📊 داده‌های استخراج شده:', {
      itemsCount: items?.length,
      totalprice,
      delivery_address
    });

    // بررسی وجود آیتم‌ها
    if (!items || !Array.isArray(items) || items.length === 0) {
      console.log('❌ آیتم‌ها نامعتبر هستند');
      return NextResponse.json({ error: 'آیتم‌های سفارش نامعتبر' }, { status: 400 });
    }

    // ایجاد سفارش جدید - فقط فیلدهای اصلی
    console.log('💾 در حال ایجاد سفارش...');
    const newOrder = await prisma.orders.create({
      data: {
        user_id: userId,
        totalprice: totalprice,
        delivery_address: delivery_address,
        status: 'pending',
        date: new Date(),
      },
    });

    console.log('✅ سفارش ایجاد شد با ID:', newOrder.id);

    // ثبت آیتم‌های سفارش
    console.log('📦 در حال ثبت آیتم‌های سفارش...');
    const orderItems = await Promise.all(
      items.map(async (item, index) => {
        console.log(`📦 ثبت آیتم ${index + 1}:`, item);
        return await prisma.order_items.create({
          data: {
            order_id: newOrder.id,
            product_id: item.product_id,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            total_price: item.total_price || (item.price * item.quantity),
          }
        });
      })
    );
    
    console.log('✅ تمام آیتم‌ها ثبت شدند:', orderItems.length);

    const response = {
      success: true,
      order: {
        id: newOrder.id,
        order_number: `#ORD-${newOrder.id.toString().padStart(6, '0')}`,
        total: Number(newOrder.totalprice)
      },
      message: 'سفارش با موفقیت ثبت شد'
    };

    console.log('✅ پاسخ نهایی:', response);
    return NextResponse.json(response);

  } catch (error) {
    console.error('❌ خطا در ایجاد سفارش:', error);
    console.error('❌ نوع خطا:', error.constructor.name);
    console.error('❌ پیام خطا:', error.message);
    console.error('❌ Stack trace:', error.stack);
    
    return NextResponse.json(
      { 
        error: 'خطا در ایجاد سفارش',
        details: error.message,
        type: error.constructor.name
      },
      { status: 500 }
    );
  }
}