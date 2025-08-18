// app/api/addresses/route.js - نسخه کاملاً درست:

import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const JWT_SECRET = process.env.JWT_SECRET || 'nikcharm-secret-key-2024';

export async function GET(request) {
  try {
    console.log('🔍 درخواست دریافت آدرس‌ها...');
    
    const authorization = request.headers.get('authorization');
    
    if (!authorization || !authorization.startsWith('Bearer ')) {
      console.log('❌ Authorization header نامعتبر');
      return NextResponse.json({
        success: false,
        message: 'لطفا وارد حساب کاربری خود شوید'
      }, { status: 401 });
    }

    const token = authorization.split(' ')[1];
    let decoded;
    
    try {
      decoded = jwt.verify(token, JWT_SECRET);
      console.log('✅ Token معتبر:', decoded.userId);
    } catch (jwtError) {
      console.error('❌ JWT Error:', jwtError.message);
      return NextResponse.json({
        success: false,
        message: 'توکن نامعتبر است'
      }, { status: 401 });
    }
    
    const userId = decoded.userId || decoded.id;
    
    if (!userId) {
      console.log('❌ UserId یافت نشد');
      return NextResponse.json({
        success: false,
        message: 'اطلاعات کاربر نامعتبر'
      }, { status: 401 });
    }

    console.log(`🔍 جستجوی آدرس‌ها برای کاربر: ${userId}`);

    // ✅ دریافت آدرس‌ها بدون relations
    const addresses = await prisma.address.findMany({
      where: {
        user_id: parseInt(userId)
      },
      select: {
        id: true,
        address: true,
        city: true,
        house_no: true,
        phone_number: true,
        postalcode: true,
        created_at: true,
        updated_at: true
      },
      orderBy: {
        created_at: 'desc'
      }
    });

    console.log(`📦 ${addresses.length} آدرس یافت شد`);

    // ✅ تبدیل BigInt اگر وجود داشته باشد
    const formattedAddresses = addresses.map(addr => ({
      id: typeof addr.id === 'bigint' ? Number(addr.id) : addr.id,
      address: addr.address,
      city: addr.city || 'نامشخص',
      house_no: addr.house_no,
      phone_number: addr.phone_number,
      postalcode: addr.postalcode,
      created_at: addr.created_at,
      updated_at: addr.updated_at
    }));

    return NextResponse.json({
      success: true,
      data: formattedAddresses
    });

  } catch (error) {
    console.error('❌ خطا در دریافت آدرس‌ها:', error);
    console.error('❌ Stack:', error.stack);
    
    return NextResponse.json({
      success: false,
      error: 'خطای سرور در دریافت آدرس‌ها',
      message: error.message
    }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    console.log('📝 شروع ایجاد آدرس جدید...');
    
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

    const addressData = await request.json();
    console.log('📝 داده‌های دریافتی:', addressData);

    // اعتبارسنجی
    if (!addressData.address || !addressData.phone_number) {
      return NextResponse.json({
        success: false,
        error: 'آدرس و شماره تلفن الزامی است'
      }, { status: 400 });
    }

    // ✅ ایجاد آدرس با فیلدهای ضروری
    const createData = {
      user_id: parseInt(userId),
      address: addressData.address,
      city: addressData.city || 'نامشخص',
      house_no: addressData.house_no || null,
      phone_number: addressData.phone_number,
      postalcode: addressData.postalcode || null,
      created_at: new Date(),
      updated_at: new Date()
    };

    // اضافه کردن state_id و city_id فقط اگر موجود باشند
    if (addressData.state_id) {
      createData.state_id = BigInt(addressData.state_id);
    }
    if (addressData.city_id) {
      createData.city_id = BigInt(addressData.city_id);
    }

    const newAddress = await prisma.address.create({
      data: createData
    });

    console.log('✅ آدرس جدید ایجاد شد:', newAddress.id);

    // ✅ تبدیل BigInt برای response
    const formattedAddress = {
      id: typeof newAddress.id === 'bigint' ? Number(newAddress.id) : newAddress.id,
      address: newAddress.address,
      city: newAddress.city,
      house_no: newAddress.house_no,
      phone_number: newAddress.phone_number,
      postalcode: newAddress.postalcode,
      created_at: newAddress.created_at,
      updated_at: newAddress.updated_at
    };

    return NextResponse.json({
      success: true,
      data: formattedAddress,
      message: 'آدرس با موفقیت اضافه شد'
    });

  } catch (error) {
    console.error('❌ خطا در ایجاد آدرس:', error);
    console.error('❌ Error details:', {
      message: error.message,
      code: error.code,
      stack: error.stack
    });
    
    return NextResponse.json({
      success: false,
      error: 'خطای سرور در ایجاد آدرس',
      message: error.message
    }, { status: 500 });
  }
}