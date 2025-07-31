import { NextResponse } from 'next/server';
import prisma from '../../../lib/prisma';

export async function GET() {
  try {
    console.log('🏛️ دریافت استان‌ها...');
    
    // استفاده از model provinces که به جدول states مپ شده
    const provinces = await prisma.provinces.findMany({
      select: {
        id: true,
        name: true,
        status: true
      },
      orderBy: {
        name: 'asc'
      }
    });

    console.log(`✅ ${provinces.length} استان یافت شد`);

    // فیلتر استان‌های فعال
    const activeProvinces = provinces.filter(p => 
      p.status === 'published' || 
      p.status === 'active' || 
      p.status === '1' || 
      p.status === 1 ||
      p.status === true
    );

    // تبدیل BigInt به Number
    const formattedProvinces = activeProvinces.map(province => ({
      id: Number(province.id),
      name: province.name
    }));

    return NextResponse.json({
      success: true,
      data: formattedProvinces,
      total: formattedProvinces.length
    });

  } catch (error) {
    console.error('❌ خطا در دریافت استان‌ها:', error);
    return NextResponse.json({
      success: false,
      message: 'خطا در دریافت استان‌ها: ' + error.message,
      error: error.stack
    }, { status: 500 });
  }
}