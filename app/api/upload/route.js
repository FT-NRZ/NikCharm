import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file'); 
    if (!file) {
      return NextResponse.json({ error: 'فایلی ارسال نشده است' }, { status: 400 });
    }
    
    const buffer = Buffer.from(await file.arrayBuffer());
    const uploadDir = path.join(process.cwd(), 'public/uploads');
    
    // اگر پوشه وجود نداشت، آن را ایجاد کن
    await fs.promises.mkdir(uploadDir, { recursive: true });
    
    // این خط را اصلاح کن:
    const safeFileName = file.name.replace(/[^\w.\-]/g, '_');
    const fileName = `${Date.now()}_${safeFileName}`;
    const filePath = path.join(uploadDir, fileName);
    
    await fs.promises.writeFile(filePath, buffer);
    
    // مسیر قابل استفاده در src تصاویر
    const url = `/uploads/${fileName}`;
    return NextResponse.json({ url });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Error uploading file' }, { status: 500 });
  }
}