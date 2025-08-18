import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// POST موجود - دست نخور
export async function POST(request) {
  try {
    const data = await request.json();
    if (!data.name || !data.category_id) {
      return NextResponse.json(
        { error: "نام زیر دسته‌بندی و دسته‌بندی والد الزامی است" },
        { status: 400 }
      );
    }
    const subcategory = await prisma.subcategories.create({
      data: {
        name: data.name,
        category_id: Number(data.category_id),
      },
    });
    return NextResponse.json(
      { message: "زیر دسته‌بندی با موفقیت ایجاد شد", subcategory },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: "خطا در ایجاد زیر دسته‌بندی" },
      { status: 500 }
    );
  }
}

// فقط این PUT جدید اضافه کن:
export async function PUT(request) {
  try {
    const { id, name } = await request.json();
    
    if (!id || !name) {
      return NextResponse.json(
        { error: "شناسه و نام زیردسته‌بندی الزامی است" },
        { status: 400 }
      );
    }

    const updatedSubcategory = await prisma.subcategories.update({
      where: { id: parseInt(id) },
      data: { name: name },
    });

    return NextResponse.json({
      message: "زیردسته‌بندی با موفقیت ویرایش شد",
      subcategory: updatedSubcategory
    });
  } catch (error) {
    console.error('Error updating subcategory:', error);
    return NextResponse.json(
      { error: 'خطا در به‌روزرسانی زیردسته‌بندی' },
      { status: 500 }
    );
  }
}