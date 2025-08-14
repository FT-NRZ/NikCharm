// app/api/categories/route.js - فقط PUT اضافه کن:

import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// GET موجود - دست نخور
export async function GET() {
  const categories = await prisma.categories.findMany({
    include: {
      subcategories: true,
    },
    orderBy: { id: "asc" },
  });
  return NextResponse.json({ categories });
}

// POST موجود - دست نخور
export async function POST(request) {
  try {
    const data = await request.json();
    if (!data.name) {
      return NextResponse.json(
        { error: "نام دسته‌بندی الزامی است" },
        { status: 400 }
      );
    }
    const category = await prisma.categories.create({
      data: {
        name: data.name,
        type: data.type || "other",
      },
    });
    return NextResponse.json(
      { message: "دسته‌بندی با موفقیت ایجاد شد", category },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: "خطا در ایجاد دسته‌بندی" },
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
        { error: "شناسه و نام دسته‌بندی الزامی است" },
        { status: 400 }
      );
    }

    const updatedCategory = await prisma.categories.update({
      where: { id: parseInt(id) },
      data: { name: name },
    });

    return NextResponse.json({
      message: "دسته‌بندی با موفقیت ویرایش شد",
      category: updatedCategory
    });
  } catch (error) {
    console.error('Error updating category:', error);
    return NextResponse.json(
      { error: 'خطا در به‌روزرسانی دسته‌بندی' },
      { status: 500 }
    );
  }
}