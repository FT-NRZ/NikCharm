import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    console.log('🔍 Fetching users...');
    
    const users = await prisma.users.findMany({
      select: {
        id: true,
        username: true,
        email: true,
        full_name: true,
        isactive: true,
        created_at: true
      },
      orderBy: {
        created_at: 'desc'
      }
    });

    console.log('✅ Users found:', users.length);

    return NextResponse.json({
      success: true,
      users: users,
      count: users.length
    });

  } catch (error) {
    console.error('❌ Database error:', error);
    return NextResponse.json({
      success: false,
      message: 'خطا در دریافت کاربران: ' + error.message
    }, { status: 500 });
  }
}