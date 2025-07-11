import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// مسیر فایل JSON (در پوشه data در ریشه پروژه)
const sliderFilePath = path.join(process.cwd(), 'data', 'slider.json');

// تابع برای خواندن اطلاعات اسلایدر
async function readSliderData() {
  try {
    await fs.promises.access(sliderFilePath, fs.constants.F_OK);
  } catch (err) {
    // اگر فایل وجود نداشت، یک آرایه خالی ایجاد کن و فایل را بنویس
    await fs.promises.mkdir(path.dirname(sliderFilePath), { recursive: true });
    await fs.promises.writeFile(sliderFilePath, JSON.stringify([]));
  }
  const data = await fs.promises.readFile(sliderFilePath, 'utf-8');
  return JSON.parse(data);
}

// تابع برای نوشتن اطلاعات به فایل JSON
async function writeSliderData(data) {
  await fs.promises.writeFile(sliderFilePath, JSON.stringify(data, null, 2));
}

// GET: دریافت لیست عکس‌های اسلایدر
export async function GET() {
  try {
    const data = await readSliderData();
    return NextResponse.json({ sliderImages: data });
  } catch (error) {
    return NextResponse.json({ error: 'Error reading slider data' }, { status: 500 });
  }
}

// POST: افزودن عکس جدید به اسلایدر
export async function POST(request) {
  try {
    const { imageUrl } = await request.json();
    if (!imageUrl) {
      return NextResponse.json({ error: 'imageUrl is required' }, { status: 400 });
    }
    const data = await readSliderData();
    // تولید شناسه جدید به صورت بیشترین id + 1 یا 1 در صورت خالی بودن آرایه
    const newId = data.length > 0 ? Math.max(...data.map(item => item.id)) + 1 : 1;
    // تعیین ترتیب به عنوان آخرین ترتیب + 1 یا برابر با id در صورت خالی بودن
    const newOrder = data.length > 0 ? Math.max(...data.map(item => item.order || 0)) + 1 : 1;
    const newSlider = { id: newId, imageUrl, order: newOrder };
    data.push(newSlider);
    await writeSliderData(data);
    return NextResponse.json({ sliderImages: data });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Error adding slider image' }, { status: 500 });
  }
}

// DELETE: حذف عکس از اسلایدر (با دریافت id به عنوان query parameter)
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const idParam = searchParams.get('id');
    const id = Number(idParam);
    if (!id) {
      return NextResponse.json({ error: 'Invalid id' }, { status: 400 });
    }
    const data = await readSliderData();
    const updatedData = data.filter(item => item.id !== id);
    await writeSliderData(updatedData);
    return NextResponse.json({ sliderImages: updatedData });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Error deleting slider image' }, { status: 500 });
  }
}