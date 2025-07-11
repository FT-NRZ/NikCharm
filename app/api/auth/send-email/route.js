import nodemailer from 'nodemailer';

export async function POST(req) {
  const testAccount = await nodemailer.createTestAccount();

  const transporter = nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    auth: {
      user: testAccount.user,
      pass: testAccount.pass,
    },
  });

  const info = await transporter.sendMail({
    from: '"Test Sender" <test@example.com>',
    to: 'norouzifatemeh22@gmail.com',
    subject: 'Hello from Next.js!',
    text: 'This is a test email.',
  });

  console.log('Preview URL:', nodemailer.getTestMessageUrl(info));

  return Response.json({
    message: 'Email sent!',
    preview: nodemailer.getTestMessageUrl(info),
  });
}