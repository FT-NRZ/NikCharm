import { NextResponse } from 'next/server'
import prisma from '../../../../lib/prisma'
import bcrypt from 'bcryptjs'
import nodemailer from 'nodemailer'

// تنظیمات ایمیل با اطلاعات شما
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT),
  secure: false, // true for 465, false for 587
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
})

// تابع ارسال ایمیل
async function sendVerificationEmail(email, code) {
  try {
    console.log('📧 ارسال ایمیل به:', email)
    
    const mailOptions = {
      from: `"نیک چارم" <${process.env.SMTP_USER}>`,
      to: email,
      subject: 'کد بازیابی رمز عبور - نیک چارم',
      html: `
        <div style="direction: rtl; font-family: Tahoma, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
          <div style="text-align: center; background-color: #0F2C59; color: white; padding: 20px; border-radius: 8px 8px 0 0;">
            <h2 style="margin: 0;">نیک چارم</h2>
            <p style="margin: 5px 0 0 0;">بازیابی رمز عبور</p>
          </div>
          
          <div style="padding: 30px; background-color: #f9f9f9;">
            <p style="font-size: 16px; margin-bottom: 20px;">سلام عزیز،</p>
            <p style="font-size: 16px; margin-bottom: 20px;">کد تایید برای بازیابی رمز عبور شما:</p>
            
            <div style="text-align: center; margin: 30px 0;">
              <div style="display: inline-block; background-color: #0F2C59; color: white; padding: 15px 30px; border-radius: 8px; font-size: 24px; font-weight: bold; letter-spacing: 3px;">
                ${code}
              </div>
            </div>
            
            <p style="font-size: 14px; color: #666; margin-top: 20px;">⏰ این کد تا ۱۰ دقیقه معتبر است.</p>
            <p style="font-size: 14px; color: #666;">🔒 از امنیت حساب خود مطمئن شوید.</p>
          </div>
          
          <div style="padding: 20px; background-color: #fff; border-top: 1px solid #eee; text-align: center;">
            <p style="font-size: 12px; color: #999; margin: 0;">
              اگر این درخواست را شما ارسال نکرده‌اید، این ایمیل را نادیده بگیرید.
            </p>
            <p style="font-size: 12px; color: #999; margin: 10px 0 0 0;">
              © ۲۰۲۴ نیک چارم - تمامی حقوق محفوظ است
            </p>
          </div>
        </div>
      `
    }

    const result = await transporter.sendMail(mailOptions)
    console.log('✅ ایمیل ارسال شد:', result.messageId)
    return true
  } catch (error) {
    console.error('❌ خطا در ارسال ایمیل:', error)
    return false
  }
}

export async function POST(request) {
  try {
    console.log('🔄 درخواست forgot-password دریافت شد')
    
    const body = await request.json()
    console.log('📦 Body:', body)
    
    const { email, step, code, newPassword } = body

    if (!email?.trim()) {
      return NextResponse.json({
        success: false,
        message: 'ایمیل الزامی است'
      }, { status: 400 })
    }

    // پیدا کردن کاربر
    const user = await prisma.users.findUnique({
      where: { email: email.trim().toLowerCase() }
    })

    if (!user) {
      return NextResponse.json({
        success: false,
        message: 'کاربری با این ایمیل یافت نشد'
      }, { status: 404 })
    }

    console.log('👤 کاربر پیدا شد:', user.email)

    // مرحله 1: ارسال کد
    if (step === 'send-code') {
      console.log('📤 ارسال کد تایید...')
      
      const verificationCode = Math.floor(100000 + Math.random() * 900000).toString()
      const codeExpiry = new Date(Date.now() + 10 * 60 * 1000) // 10 دقیقه

      try {
        // حذف کدهای قبلی
        await prisma.password_reset_tokens.deleteMany({
          where: { user_id: user.id }
        })

        // ایجاد کد جدید
        await prisma.password_reset_tokens.create({
          data: {
            user_id: user.id,
            email: user.email,
            token: verificationCode,
            expires_at: codeExpiry,
            used: false
          }
        })

        console.log('💾 کد در دیتابیس ذخیره شد:', verificationCode)

        // ارسال ایمیل
        const emailSent = await sendVerificationEmail(user.email, verificationCode)
        
        if (emailSent) {
          console.log('✅ ایمیل ارسال شد')
          return NextResponse.json({
            success: true,
            message: `کد تایید به ایمیل ${user.email} ارسال شد`,
            // فقط در development نمایش داده شود
            debug: process.env.NODE_ENV === 'development' ? { 
              code: verificationCode,
              email: user.email 
            } : undefined
          })
        } else {
          console.log('❌ خطا در ارسال ایمیل')
          return NextResponse.json({
            success: false,
            message: 'خطا در ارسال ایمیل. لطفا دوباره تلاش کنید',
            // برای تست، کد را در development نمایش دهید
            debug: process.env.NODE_ENV === 'development' ? { 
              code: verificationCode,
              note: 'ایمیل ارسال نشد، اما کد برای تست نمایش داده شده'
            } : undefined
          }, { status: 500 })
        }
      } catch (dbError) {
        console.error('❌ خطا در دیتابیس:', dbError)
        return NextResponse.json({
          success: false,
          message: 'خطا در پردازش درخواست'
        }, { status: 500 })
      }
    }

    // مرحله 2: تایید کد
    if (step === 'verify-code') {
      console.log('🔍 بررسی کد تایید...')
      
      if (!code?.trim()) {
        return NextResponse.json({
          success: false,
          message: 'کد تایید الزامی است'
        }, { status: 400 })
      }

      const resetToken = await prisma.password_reset_tokens.findFirst({
        where: {
          user_id: user.id,
          token: code.trim(),
          used: false,
          expires_at: { gt: new Date() }
        }
      })

      if (!resetToken) {
        console.log('❌ کد تایید نادرست')
        return NextResponse.json({
          success: false,
          message: 'کد تایید نادرست یا منقضی شده'
        }, { status: 400 })
      }

      console.log('✅ کد تایید صحیح است')
      return NextResponse.json({
        success: true,
        message: 'کد تایید شد. حالا رمز جدید را وارد کنید'
      })
    }

    // مرحله 3: تغییر رمز
    if (step === 'reset-password') {
      console.log('🔑 تغییر رمز عبور...')
      
      if (!code?.trim() || !newPassword?.trim()) {
        return NextResponse.json({
          success: false,
          message: 'کد تایید و رمز جدید الزامی است'
        }, { status: 400 })
      }

      if (newPassword.length < 6) {
        return NextResponse.json({
          success: false,
          message: 'رمز عبور باید حداقل 6 کاراکتر باشد'
        }, { status: 400 })
      }

      const resetToken = await prisma.password_reset_tokens.findFirst({
        where: {
          user_id: user.id,
          token: code.trim(),
          used: false,
          expires_at: { gt: new Date() }
        }
      })

      if (!resetToken) {
        return NextResponse.json({
          success: false,
          message: 'کد تایید نادرست یا منقضی شده'
        }, { status: 400 })
      }

      // hash رمز جدید
      const hashedPassword = await bcrypt.hash(newPassword, 10)

      // بروزرسانی رمز و علامت‌گذاری کد به عنوان استفاده شده
      await Promise.all([
        prisma.users.update({
          where: { id: user.id },
          data: { passwordhash: hashedPassword }
        }),
        prisma.password_reset_tokens.update({
          where: { id: resetToken.id },
          data: { used: true }
        })
      ])

      console.log('✅ رمز عبور تغییر کرد')
      return NextResponse.json({
        success: true,
        message: 'رمز عبور با موفقیت تغییر کرد. حالا می‌توانید وارد شوید'
      })
    }

    return NextResponse.json({
      success: false,
      message: 'نوع درخواست نامعتبر'
    }, { status: 400 })

  } catch (error) {
    console.error('❌ خطا در forgot-password:', error)
    return NextResponse.json({
      success: false,
      message: 'خطای سرور. لطفا دوباره تلاش کنید',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, { status: 500 })
  }
}