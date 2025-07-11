import nodemailer from 'nodemailer';

export async function sendEmail(to, subject, text, html) {
  try {
    console.log('📧 Attempting to send email to:', to);

    // ایجاد transporter با Gmail - اصلاح شده برای Next.js 15
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER, // yourname@gmail.com
        pass: process.env.GMAIL_APP_PASSWORD, // App Password (not regular password)
      },
    });

    // تنظیمات ایمیل
    const mailOptions = {
      from: `"فروشگاه چرم" <${process.env.GMAIL_USER}>`,
      to: to,
      subject: subject,
      text: text,
      html: html,
    };

    // ارسال ایمیل
    const info = await transporter.sendMail(mailOptions);
    
    console.log('✅ Email sent successfully:', info.messageId);
    return {
      success: true,
      messageId: info.messageId
    };

  } catch (error) {
    console.error('❌ Email send error:', error);
    return {
      success: false,
      error: error.message
    };
  }
}