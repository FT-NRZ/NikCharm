import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(request, { params }) {
  const { productId } = params;
  const filePath = path.join(process.cwd(), 'app', 'data', 'comments.json');

  try {
    // ایجاد فایل اگر وجود نداشته باشد
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, JSON.stringify({ comments: [] }));
    }

    const data = fs.readFileSync(filePath, 'utf-8');
    const commentsData = JSON.parse(data);
    const filteredComments = commentsData.comments.filter(
      comment => comment.productId.toString() === productId.toString()
    );

    return NextResponse.json(filteredComments);
  } catch (error) {
    return NextResponse.json(
      { error: 'خطا در دریافت نظرات' },
      { status: 500 }
    );
  }
}

export async function POST(request, { params }) {
  const { productId } = params;
  const filePath = path.join(process.cwd(), 'app', 'data', 'comments.json');

  try {
    const newComment = await request.json();

    // اعتبارسنجی داده‌ها
    if (!newComment.name?.trim() || !newComment.comment?.trim()) {
      return NextResponse.json(
        { error: 'نام و نظر الزامی هستند' },
        { status: 400 }
      );
    }

    // ایجاد ساختار نظر جدید
    const finalComment = {
      id: Date.now(),
      productId: parseInt(productId),
      name: newComment.name.trim(),
      email: newComment.email?.trim() || '',
      rating: Math.min(5, Math.max(1, parseInt(newComment.rating) || 5)),
      comment: newComment.comment.trim(),
      date: new Date().toISOString()
    };

    // خواندن و به‌روزرسانی فایل
    let commentsData = { comments: [] };
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, 'utf-8');
      commentsData = JSON.parse(data);
    }

    commentsData.comments.push(finalComment);
    fs.writeFileSync(filePath, JSON.stringify(commentsData, null, 2));

    return NextResponse.json(finalComment, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'خطا در ثبت نظر' },
      { status: 500 }
    );
  }
}