import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    console.log('🔍 شروع جستجوی استان‌ها...');
    
    const states = await prisma.State.findMany({
      select: {
        id: true,
        name: true,
      }
    });

    console.log('📋 استان‌های یافت شده:', states);

    // تبدیل BigInt به string
    const serializedStates = states.map(state => ({
      id: state.id.toString(),
      name: state.name
    }));

    console.log('🔄 داده‌های نهایی:', serializedStates);

    return NextResponse.json({
      success: true,
      data: serializedStates
    });

  } catch (error) {
    console.error('❌ خطا در API استان‌ها:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'خطا در دریافت استان‌ها',
        details: error.message 
      },
      { status: 500 }
    );
  }
}