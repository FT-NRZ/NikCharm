import { NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma'
import { sendEmail } from '../../../../lib/email';
import bcrypt from 'bcryptjs';

export async function POST(request) {
  console.log('🔥 API Route called - forgot password');
  
  try {
    const body = await request.json();
    console.log('📧 Received body:', body);
    
    const { email, step, code, newPassword } = body;

    if (!email?.trim()) {
      console.log('❌ Email validation failed');
      return NextResponse.json({
        success: false,
        message: 'ایمیل الزامی است',
      }, { status: 400 });
    }

    const user = await prisma.users.findUnique({
      where: { email: email.trim().toLowerCase() },
    });

    if (!user) {
      console.log('❌ User not found');
      return NextResponse.json({
        success: false,
        message: 'کاربری با این ایمیل یافت نشد',
      }, { status: 404 });
    }

    // مرحله 1: ارسال کد تایید
    if (step === 'send-code') {
      // تولید کد تایید 6 رقمی
      const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
      const codeExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 دقیقه اعتبار

      console.log('🔑 Generated verification code for user:', user.id);

      // ذخیره کد در دیتابیس
      await prisma.users.update({
        where: { id: user.id },
        data: {
          verification_code: verificationCode,
          code_expiry: codeExpiry,
        },
      });

      // ارسال ایمیل با کد تایید
      const emailResult = await sendEmail(
        user.email,
        'کد تایید بازیابی رمز عبور - فروشگاه چرم',
        `سلام ${user.name || 'کاربر گرامی'}، کد تایید شما: ${verificationCode}`,
        `
          <div dir="rtl" style="font-family: Arial, sans-serif; padding: 20px; background: #f8f9fa;">
            <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 10px; padding: 30px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
              <div style="text-align: center; margin-bottom: 30px;">
                <h1 style="color: #007bff; margin-bottom: 10px;">🔐 بازیابی رمز عبور</h1>
                <p style="color: #666; font-size: 16px;">فروشگاه چرم</p>
              </div>
              
              <div style="background: #f8f9ff; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
                <p style="margin: 0 0 15px 0; font-size: 16px;">سلام <strong>${user.name || 'کاربر گرامی'}</strong>,</p>
                <p style="margin: 0 0 20px 0; color: #555;">برای بازیابی رمز عبور، کد زیر را در سایت وارد کنید:</p>
                
                <div style="background: linear-gradient(135deg, #007bff, #0056b3); padding: 20px; text-align: center; border-radius: 8px; margin: 20px 0;">
                  <div style="color: white; font-size: 32px; font-weight: bold; letter-spacing: 5px; font-family: monospace;">
                    ${verificationCode}
                  </div>
                  <p style="color: #e3f2fd; font-size: 14px; margin: 10px 0 0 0;">کد تایید شما</p>
                </div>
              </div>

              <div style="background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 6px; margin: 20px 0;">
                <p style="margin: 0; color: #856404; font-size: 14px;"><strong>⚠️ نکات مهم:</strong></p>
                <ul style="margin: 10px 0 0 0; color: #856404; font-size: 14px;">
                  <li>این کد تا 10 دقیقه اعتبار دارد</li>
                  <li>فقط یک بار قابل استفاده است</li>
                  <li>اگر شما درخواست نداده‌اید، نادیده بگیرید</li>
                </ul>
              </div>

              <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
                <p style="color: #999; font-size: 12px; margin: 0;">© فروشگاه چرم - سیستم بازیابی رمز عبور</p>
              </div>
            </div>
          </div>
        `
      );

      if (!emailResult.success) {
        console.log('❌ Email send failed:', emailResult.error);
        return NextResponse.json({
          success: false,
          message: 'خطا در ارسال ایمیل: ' + emailResult.error,
        }, { status: 500 });
      }

      console.log('✅ Verification code sent successfully');
      return NextResponse.json({
        success: true,
        message: 'کد تایید به ایمیل شما ارسال شد',
      }, { status: 200 });
    }

    // مرحله 2: تایید کد
    if (step === 'verify-code') {
      if (!code?.trim()) {
        return NextResponse.json({
          success: false,
          message: 'کد تایید الزامی است',
        }, { status: 400 });
      }

      // بررسی کد و اعتبار آن
      const currentUser = await prisma.users.findUnique({
        where: { id: user.id },
        select: {
          verification_code: true,
          code_expiry: true,
        },
      });

      if (!currentUser.verification_code || !currentUser.code_expiry) {
        return NextResponse.json({
          success: false,
          message: 'کد تایید یافت نشد. لطفاً مجدداً درخواست دهید',
        }, { status: 400 });
      }

      // بررسی انقضای کد
      if (new Date() > currentUser.code_expiry) {
        // پاک کردن کد منقضی شده
        await prisma.users.update({
          where: { id: user.id },
          data: {
            verification_code: null,
            code_expiry: null,
          },
        });

        return NextResponse.json({
          success: false,
          message: 'کد تایید منقضی شده است. لطفاً مجدداً درخواست دهید',
        }, { status: 400 });
      }

      // بررسی صحت کد
      if (currentUser.verification_code !== code.trim()) {
        return NextResponse.json({
          success: false,
          message: 'کد تایید نادرست است',
        }, { status: 400 });
      }

      console.log('✅ Verification code validated successfully');
      return NextResponse.json({
        success: true,
        message: 'کد تایید شد',
      }, { status: 200 });
    }

    // مرحله 3: تغییر رمز عبور
    if (step === 'reset-password') {
      if (!code?.trim() || !newPassword?.trim()) {
        return NextResponse.json({
          success: false,
          message: 'کد تایید و رمز عبور جدید الزامی است',
        }, { status: 400 });
      }

      if (newPassword.length < 6) {
        return NextResponse.json({
          success: false,
          message: 'رمز عبور باید حداقل 6 کاراکتر باشد',
        }, { status: 400 });
      }

      // بررسی مجدد کد تایید
      const currentUser = await prisma.users.findUnique({
        where: { id: user.id },
        select: {
          verification_code: true,
          code_expiry: true,
        },
      });

      if (!currentUser.verification_code || !currentUser.code_expiry) {
        return NextResponse.json({
          success: false,
          message: 'کد تایید یافت نشد',
        }, { status: 400 });
      }

      if (new Date() > currentUser.code_expiry) {
        return NextResponse.json({
          success: false,
          message: 'کد تایید منقضی شده است',
        }, { status: 400 });
      }

      if (currentUser.verification_code !== code.trim()) {
        return NextResponse.json({
          success: false,
          message: 'کد تایید نادرست است',
        }, { status: 400 });
      }

      // هش کردن رمز جدید
      const hashedNewPassword = await bcrypt.hash(newPassword, 12);

      // به‌روزرسانی رمز عبور و پاک کردن کد تایید
      await prisma.users.update({
        where: { id: user.id },
        data: {
          passwordhash: hashedNewPassword,
          verification_code: null,
          code_expiry: null,
        },
      });

      // ارسال ایمیل تایید تغییر رمز
      await sendEmail(
        user.email,
        'رمز عبور تغییر کرد - فروشگاه نیک چرم',
        `سلام ${user.name || 'کاربر گرامی'}، رمز عبور شما با موفقیت تغییر کرد.`,
        `
          <div dir="rtl" style="font-family: Arial, sans-serif; padding: 20px; background: #f8f9fa;">
            <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 10px; padding: 30px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
              <div style="text-align: center; margin-bottom: 30px;">
                <h1 style="color: #28a745; margin-bottom: 10px;">✅ رمز عبور تغییر کرد</h1>
                <p style="color: #666; font-size: 16px;">فروشگاه نیک چرم</p>
              </div>
              
              <div style="background: #d4edda; border: 1px solid #c3e6cb; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
                <p style="margin: 0 0 10px 0; font-size: 16px;">سلام <strong>${user.name || 'کاربر گرامی'}</strong>,</p>
                <p style="margin: 0; color: #155724;">رمز عبور حساب کاربری شما با موفقیت تغییر کرد.</p>
              </div>

              <div style="background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 6px;">
                <p style="margin: 0 0 10px 0; color: #856404; font-size: 14px;"><strong>🔒 نکات امنیتی:</strong></p>
                <ul style="margin: 0; color: #856404; font-size: 14px;">
                  <li>اگر این تغییر توسط شما انجام نشده، فوراً با پشتیبانی تماس بگیرید</li>
                  <li>رمز عبور خود را با کسی به اشتراک نگذارید</li>
                  <li>از رمزهای قوی و منحصر به فرد استفاده کنید</li>
                </ul>
              </div>

              <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
                <p style="color: #999; font-size: 12px; margin: 0;">تاریخ: ${new Date().toLocaleDateString('fa-IR')}</p>
                <p style="color: #999; font-size: 12px; margin: 5px 0 0 0;">© فروشگاه نیک چرم</p>
              </div>
            </div>
          </div>
        `
      );

      console.log('✅ Password reset successful');
      return NextResponse.json({
        success: true,
        message: 'رمز عبور با موفقیت تغییر کرد',
      }, { status: 200 });
    }

    // اگر step نامعتبر باشد
    return NextResponse.json({
      success: false,
      message: 'درخواست نامعتبر',
    }, { status: 400 });

  } catch (error) {
    console.error('💥 Error in forgot password:', error);
    return NextResponse.json({
      success: false,
      message: 'خطای سرور داخلی',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, { status: 500 });
  }
}