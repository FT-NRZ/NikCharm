import { NextResponse } from 'next/server';
import prisma from '../../../../lib/prisma';

export async function GET(request, { params }) {
  try {
    // await کردن params قبل از استفاده
    const resolvedParams = await params;
    const stateId = BigInt(resolvedParams.stateId);
    
    const cities = await prisma.City.findMany({
      where: {
        state_id: stateId
      },
      select: {
        id: true,
        name: true,
        status: true
      }
    });

    const serializedCities = cities.map(city => ({
      id: city.id.toString(),
      name: city.name,
      status: city.status
    }));

    return NextResponse.json({ 
      success: true, 
      data: serializedCities 
    });

  } catch (error) {
    console.error('❌ خطا:', error);
    return NextResponse.json(
      { success: false, error: 'خطا در دریافت شهرها' },
      { status: 500 }
    );
  }
}