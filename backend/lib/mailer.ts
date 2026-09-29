import nodemailer = require("nodemailer");

import { getMicrosoftAccessToken } from "./microsoft-oauth.service.js";

const smtpHost = process.env.SMTP_HOST;
const smtpPort = Number(process.env.SMTP_PORT);
const smtpUser = process.env.SMTP_USER;
const mailFrom = process.env.MAIL_FROM;

if (!smtpHost) {
    throw new Error("SMTP_HOST is missing from environment variables");
}

if (!smtpPort || Number.isNaN(smtpPort)) {
    throw new Error("SMTP_PORT is missing or invalid");
}

if (!smtpUser) {
    throw new Error("SMTP_USER is missing from environment variables");
}

if (!mailFrom) {
    throw new Error("MAIL_FROM is missing from environment variables");
}

async function createMailer() {

    const accessToken = await getMicrosoftAccessToken();

    return nodemailer.createTransport({
        host: smtpHost,
        port: smtpPort,
        secure: false,
        requireTLS: true,
        auth: {
            type: "OAuth2",
            user: smtpUser,
            accessToken,
        },
    });
}

/*
* security improvement: if username validation ever becomes loose enough
* this function will act as a helper to prevent
* */
function escapeHtml(value: string): string {

  return value

    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export async function sendVerificationEmail(to: string, code: string) {
  const appName = "Garbo";

  const mailer = await createMailer();
  await mailer.sendMail({
    from: mailFrom,
    to,
    subject: `Your ${appName} verification code`,
    text: `Your ${appName} verification code is: ${code}\n\nThis code expires in 10 minutes.`,
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.4">
        <h2>${appName} Email Verification</h2>
        <p>Your verification code is:</p>
        <p 
        style="font-size: 28px; 
        font-weight: bold; 
        letter-spacing: 4px;">${code}
        </p>
        <p>This code expires in <b>10 minutes</b>.</p>
      </div>
    `,
  });
}

export async function sendUsernameRecoveryEmail(
    email: string,
    username: string
) {

  const appName = "Garbo";

  try {

    const mailer = await createMailer();
    const safeUsername = escapeHtml(username);

    await mailer.sendMail({

      from: mailFrom,

      to: email,

      subject: `${appName} Username Recovery`,

      text: `Hello, you recently requested help recovering your ${appName} username.

             Your username is:
  
            ${username}
            
            You can now return to ${appName} and log in using this username.
            
            If you did not request your username, you can safely ignore this email.
            
            — ${appName}`.trim(),

      html: `

        <div

          style="
            font-family: Arial, sans-serif;
            max-width: 600px;
            margin: 0 auto;
            padding: 24px;
          "
        >

          <h2>
            ${appName} Username Recovery
          </h2>

          <p>
            You recently requested help recovering your ${appName} username.
          </p>

          <p>
            Your username is:
          </p>

          <div

            style="
              padding: 16px;
              margin: 20px 0;
              background-color: #f3f3f3;
              border-radius: 8px;
              text-align: center;
            "
          >

            <strong
              style="font-size: 24px;"
            >
              ${safeUsername}
            </strong>

          </div>

          <p>
            You can now return to ${appName} and log in using this username.
          </p>

          <p>
            If you did not request your username, you can safely ignore this email.
          </p>

          <p>
            — ${appName}
          </p>
        </div>
      `
    });
    console.log(`Username recovery email sent to ${email}`);
  } catch (err) {
    console.error("Unable to send username recovery email:", err);
    throw err;
  }
}