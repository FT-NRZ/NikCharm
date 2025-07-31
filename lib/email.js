import nodemailer from 'nodemailer';

console.log('📧 Email service loading...');
console.log('SMTP_USER:', process.env.SMTP_USER);
console.log('SMTP_HOST:', process.env.SMTP_HOST);

// ✅ اصلاح: createTransport نه createTransporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT) || 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function sendEmail(to, subject, text, html) {
  try {
    console.log('📧 Attempting to send email to:', to);
    console.log('📧 SMTP Config:', {
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      user: process.env.SMTP_USER,
      passLength: process.env.SMTP_PASS?.length
    });
    
    const info = await transporter.sendMail({
      from: `"فروشگاه نیک چرم" <${process.env.SMTP_USER}>`,
      to: to,
      subject: subject,
      text: text,
      html: html,
    });

    console.log('✅ Email sent successfully:', info.messageId);
    return { 
      success: true, 
      messageId: info.messageId 
    };
  } catch (error) {
    console.error('❌ Email send failed:', error);
    return { 
      success: false, 
      error: error.message 
    };
  }
}