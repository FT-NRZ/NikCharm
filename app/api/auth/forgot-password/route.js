import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
// تغییر import nodemailer
const nodemailer = require('nodemailer')

// تنظیمات ایمیل - اصلاح شده
const createTransporter = () => {
  console.log('📧 Creating transporter with:', {
    user: process.env.SMTP_USER ? 'SET' : 'NOT SET',
    pass: process.env.SMTP_PASS ? 'SET' : 'NOT SET'
  });

  // خط 15 را تغییر دهید:
return nodemailer.createTransport({  // حذف 'er' از آخر
    service: 'gmail',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });
};

// تابع ارسال ایمیل
async function sendVerificationEmail(email, code) {
  try {
    console.log('📧 Sending email to:', email);
    
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
      console.log('⚠️ SMTP credentials missing!');
      return false;
    }

    const transporter = createTransporter();
    
    const mailOptions = {
      from: `"نیک چارم" <${process.env.SMTP_USER}>`,
      to: email,
      subject: 'کد بازیابی رمز عبور - نیک چارم',
      html: `
        <div style="direction: rtl; font-family: Arial, sans-serif; padding: 20px;">
          <h2>نیک چارم</h2>
          <p>کد بازیابی رمز عبور شما:</p>
          <h1 style="color: #0F2C59; font-size: 32px;">${code}</h1>
          <p>این کد تا ۱۰ دقیقه معتبر است.</p>
        </div>
      `
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('✅ Email sent:', result.messageId);
    return true;
    
  } catch (error) {
    console.error('❌ Email error:', error.message);
    return false;
  }
}

export async function POST(request) {
  console.log('🔄 POST /api/auth/forgot-password');
  
  try {
    const body = await request.json();
    const { email, step, code, newPassword } = body;

    if (!email?.trim()) {
      return NextResponse.json({
        success: false,
        message: 'ایمیل الزامی است'
      }, { status: 400 });
    }

    const user = await prisma.users.findUnique({
      where: { email: email.trim().toLowerCase() }
    });

    if (!user) {
      return NextResponse.json({
        success: false,
        message: 'کاربری با این ایمیل یافت نشد'
      }, { status: 404 });
    }

    // مرحله 1: ارسال کد
    if (step === 'send-code') {
      const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
      const codeExpiry = new Date(Date.now() + 10 * 60 * 1000);

      await prisma.password_reset_tokens.deleteMany({
        where: { user_id: user.id }
      });

      await prisma.password_reset_tokens.create({
        data: {
          user_id: user.id,
          email: user.email,
          token: verificationCode,
          expires_at: codeExpiry,
          used: false
        }
      });

      const emailSent = await sendVerificationEmail(user.email, verificationCode);
      
      return NextResponse.json({
        success: true,
        message: `کد تایید به ایمیل ${user.email} ارسال شد`,
        debug: { 
          code: verificationCode,
          email_sent: emailSent
        }
      });
    }

    // مرحله 2: تایید کد
    if (step === 'verify-code') {
      if (!code?.trim()) {
        return NextResponse.json({
          success: false,
          message: 'کد تایید الزامی است'
        }, { status: 400 });
      }

      const resetToken = await prisma.password_reset_tokens.findFirst({
        where: {
          user_id: user.id,
          token: code.trim(),
          used: false,
          expires_at: { gt: new Date() }
        }
      });

      if (!resetToken) {
        return NextResponse.json({
          success: false,
          message: 'کد تایید نادرست یا منقضی شده'
        }, { status: 400 });
      }

      return NextResponse.json({
        success: true,
        message: 'کد تایید شد. حالا رمز جدید را وارد کنید'
      });
    }

    // مرحله 3: تغییر رمز عبور
    if (step === 'reset-password') {
      if (!code?.trim() || !newPassword?.trim()) {
        return NextResponse.json({
          success: false,
          message: 'کد تایید و رمز جدید الزامی است'
        }, { status: 400 });
      }

      if (newPassword.length < 6) {
        return NextResponse.json({
          success: false,
          message: 'رمز عبور باید حداقل 6 کاراکتر باشد'
        }, { status: 400 });
      }

      const resetToken = await prisma.password_reset_tokens.findFirst({
        where: {
          user_id: user.id,
          token: code.trim(),
          used: false,
          expires_at: { gt: new Date() }
        }
      });

      if (!resetToken) {
        return NextResponse.json({
          success: false,
          message: 'کد تایید نادرست یا منقضی شده'
        }, { status: 400 });
      }

      // Hash new password
      const hashedPassword = await bcrypt.hash(newPassword, 10);

      // Update password and mark token as used
      await Promise.all([
        prisma.users.update({
          where: { id: user.id },
          data: { passwordhash: hashedPassword }
        }),
        prisma.password_reset_tokens.update({
          where: { id: resetToken.id },
          data: { used: true }
        })
      ]);

      return NextResponse.json({
        success: true,
        message: 'رمز عبور با موفقیت تغییر کرد. حالا می‌توانید وارد شوید'
      });
    }

    return NextResponse.json({
      success: false,
      message: 'نوع درخواست نامعتبر'
    }, { status: 400 });

  } catch (error) {
    console.error('❌ General error:', error);
    return NextResponse.json({
      success: false,
      message: 'خطای سرور'
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ message: 'Forgot password API is working' });
}