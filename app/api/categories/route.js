import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// گرفتن لیست دسته‌بندی‌ها
export async function GET() {
  const categories = await prisma.categories.findMany({
    include: {
      subcategories: true,
    },
    orderBy: { id: "asc" },
  });
  return NextResponse.json({ categories });
}

// افزودن دسته‌بندی جدید
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