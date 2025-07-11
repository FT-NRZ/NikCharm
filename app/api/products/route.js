import { NextResponse } from 'next/server';
import prisma from '../../../lib/prisma';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (id) {
      // دریافت یک محصول بر اساس id
      const product = await prisma.products.findUnique({
        where: { id: parseInt(id) },
        include: {
          categories: true,
          product_images: true, // اضافه شد
        }
      });

      if (!product) {
        return NextResponse.json({ error: 'محصول یافت نشد' }, { status: 404 });
      }
      return NextResponse.json({ product }, { status: 200 });
    } else {
      // بازگردانی لیست محصولات با تصاویر
      const products = await prisma.products.findMany({
        include: {
          categories: true,
          product_images: true, // اضافه شد
        }
      });
      return NextResponse.json({ products }, { status: 200 });
    }
  } catch (error) {
    console.error('خطا در دریافت اطلاعات:', error);
    return NextResponse.json({ error: 'خطا در دریافت اطلاعات محصولات' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const data = await request.json();

    // اعتبارسنجی فیلدهای اجباری
    if (!data.name || !data.price || !data.categoryid) {
      return NextResponse.json(
        { error: 'نام، قیمت و دسته‌بندی الزامی هستند' },
        { status: 400 }
      );
    }
    if (isNaN(parseFloat(data.price))) {
      return NextResponse.json({ error: 'قیمت نامعتبر است' }, { status: 400 });
    }

    // ایجاد محصول جدید با تصاویر
    const product = await prisma.products.create({
      data: {
        name: data.name,
        price: parseFloat(data.price),
        categoryid: parseInt(data.categoryid),
        discount: data.discount ? parseInt(data.discount) : 0,
        color: data.color || null,
        size: data.size ? parseInt(data.size) : null,
        material: data.material || null,
        information: data.information || null,
        number_of_comments: 0,
        stock_quantity: data.stock_quantity ? parseInt(data.stock_quantity) : 0,
        product_images: {
          create: Array.isArray(data.images)
            ? data.images.map((url) => ({ url }))
            : [],
        },
      },
      include: {
        product_images: true,
      }
    });

    return NextResponse.json(
      { message: 'محصول با موفقیت ایجاد شد', product },
      { status: 201 }
    );
  } catch (error) {
    console.error('خطا در ایجاد محصول:', error);
    if (error.code === 'P2002') {
      return NextResponse.json({ error: 'نام محصول تکراری است' }, { status: 400 });
    }
    if (error.code === 'P2003') {
      return NextResponse.json({ error: 'دسته‌بندی انتخاب شده وجود ندارد' }, { status: 400 });
    }
    return NextResponse.json({ error: 'خطای سرور در ایجاد محصول' }, { status: 500 });
  }
}
export async function PUT(request) {
  try {
    const data = await request.json();
    if (!data.id) {
      return NextResponse.json({ error: "شناسه محصول ارسال نشده" }, { status: 400 });
    }

    // ویرایش اطلاعات محصول
    const updated = await prisma.products.update({
      where: { id: Number(data.id) },
      data: {
        name: data.name,
        price: parseFloat(data.price),
        categoryid: parseInt(data.categoryid),
        discount: data.discount ? parseInt(data.discount) : 0,
        color: data.color || null,
        size: data.size ? parseInt(data.size) : null,
        material: data.material || null,
        information: data.information || null,
        stock_quantity: data.stock_quantity ? parseInt(data.stock_quantity) : 0,
        // تصاویر: حذف قبلی و افزودن جدید
        product_images: {
          deleteMany: {},
          create: Array.isArray(data.images)
            ? data.images.map((url) => ({ url }))
            : [],
        },
      },
      include: {
        product_images: true,
      }
    });

    return NextResponse.json(
      { message: 'محصول با موفقیت ویرایش شد', product: updated },
      { status: 200 }
    );
  } catch (error) {
    console.error('خطا در ویرایش محصول:', error);
    return NextResponse.json({ error: 'خطای سرور در ویرایش محصول' }, { status: 500 });
  }
}