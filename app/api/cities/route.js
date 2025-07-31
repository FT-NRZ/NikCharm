import { NextResponse } from 'next/server';
import prisma from '../../../lib/prisma';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const provinceId = searchParams.get('province_id');

    console.log('🏙️ دریافت شهرها برای استان:', provinceId);

    if (!provinceId) {
      return NextResponse.json({
        success: false,
        message: 'شناسه استان الزامی است'
      }, { status: 400 });
    }

    // استفاده از model cities
    const cities = await prisma.cities.findMany({
      where: {
        province_id: BigInt(provinceId),
        status: 1 // فقط شهرهای فعال
      },
      select: {
        id: true,
        name: true,
        province_id: true,
        status: true
      },
      orderBy: {
        name: 'asc'
      }
    });

    console.log(`✅ ${cities.length} شهر برای استان ${provinceId} یافت شد`);

    // تبدیل BigInt به Number
    const formattedCities = cities.map(city => ({
      id: Number(city.id),
      name: city.name,
      province_id: Number(city.province_id)
    }));

    return NextResponse.json({
      success: true,
      data: formattedCities,
      total: formattedCities.length
    });

  } catch (error) {
    console.error('❌ خطا در دریافت شهرها:', error);
    return NextResponse.json({
      success: false,
      message: 'خطا در دریافت شهرها: ' + error.message,
      error: error.stack
    }, { status: 500 });
  }
}