import { NextResponse } from 'next/server';
import prisma from '../../../../lib/prisma';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'nikcharm-secret-key-2024';

// دریافت آدرس خاص
export async function GET(request, { params }) {
  try {
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
    
    const resolvedParams = await params;
    const addressId = parseInt(resolvedParams.id);

    const address = await prisma.address.findFirst({
      where: {
        id: addressId,
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
      }
    });

    if (!address) {
      return NextResponse.json({
        success: false,
        message: 'آدرس مورد نظر یافت نشد'
      }, { status: 404 });
    }

    const formattedAddress = {
      id: address.id,
      address: address.address,
      city: address.city,
      house_no: address.house_no,
      phone_number: address.phone_number,
      postalcode: address.postalcode,
      province: address.province ? {
        id: Number(address.province.id),
        name: address.province.name
      } : null,
      city_info: address.city_info ? {
        id: Number(address.city_info.id),
        name: address.city_info.name
      } : null,
      state_id: Number(address.state_id),
      city_id: Number(address.city_id),
      created_at: address.created_at,
      updated_at: address.updated_at
    };

    return NextResponse.json({
      success: true,
      data: formattedAddress
    });

  } catch (error) {
    console.error('❌ خطا در دریافت آدرس:', error);
    return NextResponse.json({
      success: false,
      message: 'خطا در دریافت آدرس: ' + error.message
    }, { status: 500 });
  }
}

// حذف آدرس
export async function DELETE(request, { params }) {
  try {
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
    
    const resolvedParams = await params;
    const addressId = parseInt(resolvedParams.id);

    // بررسی مالکیت آدرس
    const existingAddress = await prisma.address.findFirst({
      where: {
        id: addressId,
        user_id: parseInt(userId)
      }
    });

    if (!existingAddress) {
      return NextResponse.json({
        success: false,
        message: 'آدرس مورد نظر یافت نشد یا مجاز به حذف آن نیستید'
      }, { status: 404 });
    }

    // حذف آدرس
    await prisma.address.delete({
      where: {
        id: addressId
      }
    });

    return NextResponse.json({
      success: true,
      message: 'آدرس با موفقیت حذف شد'
    });

  } catch (error) {
    console.error('❌ خطا در حذف آدرس:', error);
    return NextResponse.json({
      success: false,
      message: 'خطا در حذف آدرس: ' + error.message
    }, { status: 500 });
  }
}