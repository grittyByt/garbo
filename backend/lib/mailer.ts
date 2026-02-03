import nodemailer from "nodemailer";

export const mailer = nodemailer.createTransport({
  host: process.env.SMTP_HOST!,
  port: Number(process.env.SMTP_PORT ?? 587),
  secure: false,
  auth: {
    user: process.env.SMTP_USER!,
    pass: process.env.SMTP_PASS!,
  },
});

export async function sendVerificationEmail(to: string, code: string) {
  const appName = "Garbo";
  await mailer.sendMail({
    from: process.env.MAIL_FROM ?? `"${appName}" <no-reply@garbo.app>`,
    to,
    subject: `${appName} verification code`,
    text: `Your ${appName} verification code is: ${code}\n\nThis code expires in 10 minutes.`,
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.4">
        <h2>${appName} Email Verification</h2>
        <p>Your verification code is:</p>
        <p style="font-size: 28px; font-weight: bold; letter-spacing: 4px;">${code}</p>
        <p>This code expires in <b>10 minutes</b>.</p>
      </div>
    `,
  });
}