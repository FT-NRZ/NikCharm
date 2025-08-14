// app/api/states-cities/route.js
import { NextResponse } from 'next/server';
import prisma from '../../../lib/prisma';

export async function GET() {
  try {
    console.log('🔍 شروع دریافت استان‌ها با شهرها...');

    // دریافت استان‌ها همراه با شهرهای مربوطه
    const states = await prisma.State.findMany({
      select: {
        id: true,
        name: true,
        status: true,
        cities: {
          select: {
            id: true,
            name: true,
            status: true,
            slug: true
          },
          orderBy: {
            name: 'asc'
          }
        }
      },
      orderBy: {
        name: 'asc'
      }
    });

    console.log('✅ استان‌های یافت شده:', states.length);

    if (!states || states.length === 0) {
      return NextResponse.json({ 
        success: true, 
        data: [], 
        message: 'هیچ استانی در دیتابیس یافت نشد' 
      });
    }

    // فیلتر کردن و تبدیل داده‌ها
    const serializedStates = states.map(state => {
      // فیلتر کردن شهرهای فعال (status = 1)
      const activeCities = state.cities.filter(city => city.status === 1);
      
      // اگر شهر فعالی نبود، همه شهرها را نمایش بده
      const citiesToShow = activeCities.length > 0 ? activeCities : state.cities;

      return {
        id: state.id.toString(),
        name: state.name,
        status: state.status,
        cities: citiesToShow.map(city => ({
          id: city.id.toString(),
          name: city.name,
          slug: city.slug,
          status: city.status
        })),
        cityCount: citiesToShow.length
      };
    });

    // فیلتر کردن استان‌هایی که شهر دارند
    const statesWithCities = serializedStates.filter(state => state.cities.length > 0);

    console.log('✅ استان‌های دارای شهر:', statesWithCities.length);

    return NextResponse.json({ 
      success: true, 
      data: statesWithCities,
      total: statesWithCities.length,
      message: 'استان‌ها و شهرها با موفقیت دریافت شدند'
    });

  } catch (error) {
    console.error('❌ خطای کامل:', error);
    console.error('❌ پیام خطا:', error.message);
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'خطا در دریافت استان‌ها و شهرها', 
        details: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
    console.log('🔌 اتصال دیتابیس قطع شد');
  }
}