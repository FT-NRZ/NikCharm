import fs from 'fs/promises';
import path from 'path';

export async function POST(request) {
  try {
    const { id, updatedProduct } = await request.json();

    // مسیر فایل JSON
    const filePath = path.join(process.cwd(), 'app', 'data', 'products.json');

    // خواندن محتوای فعلی فایل JSON
    const fileData = await fs.readFile(filePath, 'utf-8');
    const jsonData = JSON.parse(fileData);

    // یافتن اندیس محصول برای به‌روزرسانی
    const productIndex = jsonData.products.findIndex((product) => product.id === parseInt(id));

    if (productIndex === -1) {
      return new Response(JSON.stringify({ error: 'محصول مورد نظر یافت نشد' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // به‌روزرسانی محصول
    jsonData.products[productIndex] = {
      ...jsonData.products[productIndex],
      ...updatedProduct,
    };

    // نوشتن داده‌های به‌روزرسانی‌شده به فایل JSON
    await fs.writeFile(filePath, JSON.stringify(jsonData, null, 2), 'utf-8');

    return new Response(JSON.stringify({ message: 'محصول با موفقیت به‌روزرسانی شد' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('خطا در به‌روزرسانی محصول:', error);
    return new Response(JSON.stringify({ error: 'خطا در به‌روزرسانی محصول' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}