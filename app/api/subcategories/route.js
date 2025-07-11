import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// افزودن زیر دسته‌بندی جدید
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