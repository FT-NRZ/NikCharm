import { NextResponse } from 'next/server';
import prisma from '../../../lib/prisma';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'nikcharm-secret-key-2024';

export async function GET(request) {
  try {
    console.log('🔍 درخواست دریافت آدرس‌ها...');
    
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
    
    if (!userId) {
      return NextResponse.json({
        success: false,
        message: 'اطلاعات کاربر نامعتبر'
      }, { status: 401 });
    }

    // دریافت آدرس‌ها با relations
    const addresses = await prisma.address.findMany({
      where: {
        user_id: parseInt(userId)
      },
      include: {
        province: {
          select: {
            id: true,
            name: true
          }
        },
        city_info: {
          select: {
            id: true,
            name: true
          }
        }
      },
      orderBy: {
        created_at: 'desc'
      }
    });

    console.log(`✅ ${addresses.length} آدرس یافت شد`);

    if (addresses.length === 0) {
      return NextResponse.json({
        success: true,
        data: [],
        message: 'هیچ آدرسی یافت نشد'
      });
    }

    // فرمت کردن آدرس‌ها
    const formattedAddresses = addresses.map(addr => ({
      id: addr.id,
      address: addr.address,
      house_no: addr.house_no,
      phone_number: addr.phone_number,
      postalcode: addr.postalcode,
      city: addr.city,
      province: addr.province ? {
        id: Number(addr.province.id),
        name: addr.province.name
      } : null,
      city_info: addr.city_info ? {
        id: Number(addr.city_info.id),
        name: addr.city_info.name
      } : null,
      state_id: addr.state_id ? Number(addr.state_id) : null,
      city_id: addr.city_id ? Number(addr.city_id) : null,
      created_at: addr.created_at,
      updated_at: addr.updated_at
    }));

    return NextResponse.json({
      success: true,
      data: formattedAddresses,
      message: 'آدرس‌ها با موفقیت دریافت شدند'
    });

  } catch (error) {
    console.error('❌ خطا در GET:', error);
    return NextResponse.json({
      success: false,
      message: 'خطا در دریافت آدرس‌ها: ' + error.message,
      error: error.stack
    }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    console.log('📤 درخواست ایجاد آدرس جدید...');
    
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

    const body = await request.json();
    console.log('📦 داده‌های دریافتی:', body);

    // اعتبارسنجی
    if (!body.address || !body.phone_number || !body.province_id || !body.city_id) {
      return NextResponse.json({
        success: false,
        message: 'تمام فیلدهای الزامی را پر کنید (آدرس، تلفن، استان، شهر)'
      }, { status: 400 });
    }

    // بررسی وجود استان و شهر
    try {
      const province = await prisma.provinces.findUnique({
        where: { id: BigInt(body.province_id) }
      });

      const city = await prisma.cities.findUnique({
        where: { id: BigInt(body.city_id) }
      });

      if (!province) {
        return NextResponse.json({
          success: false,
          message: 'استان انتخابی نامعتبر است'
        }, { status: 400 });
      }

      if (!city) {
        return NextResponse.json({
          success: false,
          message: 'شهر انتخابی نامعتبر است'
        }, { status: 400 });
      }

      console.log('✅ استان و شهر معتبر هستند');

    } catch (validationError) {
      console.error('❌ خطا در اعتبارسنجی:', validationError);
      return NextResponse.json({
        success: false,
        message: 'خطا در اعتبارسنجی استان/شهر: ' + validationError.message
      }, { status: 400 });
    }

    // ایجاد آدرس جدید
    const newAddress = await prisma.address.create({
      data: {
        user_id: parseInt(userId),
        address: body.address.trim(),
        city: body.city || 'نامشخص',
        house_no: body.house_no || null,
        phone_number: body.phone_number.trim(),
        postalcode: body.postalcode || null,
        state_id: BigInt(body.province_id),
        city_id: BigInt(body.city_id)
      },
      include: {
        province: {
          select: {
            id: true,
            name: true
          }
        },
        city_info: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    console.log('✅ آدرس ایجاد شد:', newAddress.id);

    // فرمت پاسخ
    const formattedAddress = {
      id: newAddress.id,
      address: newAddress.address,
      city: newAddress.city,
      house_no: newAddress.house_no,
      phone_number: newAddress.phone_number,
      postalcode: newAddress.postalcode,
      province: newAddress.province ? {
        id: Number(newAddress.province.id),
        name: newAddress.province.name
      } : null,
      city_info: newAddress.city_info ? {
        id: Number(newAddress.city_info.id),
        name: newAddress.city_info.name
      } : null,
      state_id: Number(newAddress.state_id),
      city_id: Number(newAddress.city_id),
      created_at: newAddress.created_at
    };

    return NextResponse.json({
      success: true,
      message: 'آدرس با موفقیت ثبت شد',
      data: formattedAddress
    });

  } catch (error) {
    console.error('❌ خطا در POST:', error);
    return NextResponse.json({
      success: false,
      message: 'خطا در ثبت آدرس: ' + error.message,
      error: error.stack
    }, { status: 500 });
  }
}