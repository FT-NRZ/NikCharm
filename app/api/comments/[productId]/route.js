import { NextResponse } from 'next/server';
import prisma from '../../../../lib/prisma';

export async function GET(request, { params }) {
  const { productId } = params;
  try {
    const comments = await prisma.comments.findMany({
      where: { product_id: Number(productId) },
      orderBy: { date: 'desc' },
      include: {
        users: { select: { full_name: true } }
      }
    });
    return NextResponse.json({ comments });
  } catch (error) {
    return NextResponse.json({ error: 'خطا در دریافت نظرات' }, { status: 500 });
  }
}

export async function POST(request, { params }) {
  const { productId } = params;
  try {
    const body = await request.json();
    if (!body.userId || !body.comment?.trim() || !body.rating) {
      return NextResponse.json({ error: 'اطلاعات ناقص است' }, { status: 400 });
    }
    const newComment = await prisma.comments.create({
      data: {
        user_id: Number(body.userId),
        product_id: Number(productId),
        text: body.comment.trim(),
        stars: Math.min(5, Math.max(1, parseInt(body.rating))),
        date: new Date()
      },
      include: {
        users: { select: { full_name: true } }
      }
    });
    return NextResponse.json({ comment: newComment }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'خطا در ثبت نظر' }, { status: 500 });
  }
}