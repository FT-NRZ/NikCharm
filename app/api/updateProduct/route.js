import { NextResponse } from 'next/server';
import prisma from '../../../lib/prisma';

export async function POST(request) {
  try {
    const data = await request.json();

    // اعتبارسنجی فیلدهای اجباری
    if (!data.id || !data.name || !data.price || !data.categoryid) {
      return NextResponse.json(
        { error: 'اطلاعات ارسالی ناقص است' },
        { status: 400 }
      );
    }

    // ویرایش محصول در دیتابیس
    const updated = await prisma.products.update({
      where: { id: Number(data.id) },
      data: {
        name: data.name,
        categoryid: Number(data.categoryid),
        material: data.material,
        color: data.color,
        price: Number(data.price),
        image_url: data.image_url,
        stock_quantity: Number(data.stock_quantity),
      },
    });

    return NextResponse.json(
      { message: 'محصول با موفقیت ویرایش شد', product: updated },
      { status: 200 }
    );
  } catch (error) {
    console.error('خطا در ویرایش محصول:', error);
    return NextResponse.json(
      { error: 'خطا در ویرایش محصول' },
      { status: 500 }
    );
  }
}