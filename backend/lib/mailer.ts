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

export async function sendVerificationEmail(to: string, code: string): Promise<void> {

    const appName = "Garbo";
    const mailer = await createMailer();

    await mailer.sendMail({
        from: mailFrom,
        to,

        subject: `Verify your ${appName} email address`,

        // Plain-text fallback
        text: `${appName} Automated Email Services

        Please verify your email address
        
        We want to say thanks for signing up and creating your ${appName} account.
        ${appName} is here to help organize your inbox.
        
        Enter the verification code below to finish setting up your account:
        
        ${code}
        
        This code expires in 10 minutes.
        
        If you didn't create a ${appName} account, you can safely ignore this email.
        
        © 2026 ${appName}
        
        thegarbagebot.com
                `.trim(),

        // HTML version
        html: `
        <!DOCTYPE html>
        
        <html lang="en">
        
        <head>
            <meta charset="UTF-8">
        
            <meta
                name="viewport"
                content="width=device-width, initial-scale=1.0"
            >
        
            <title>
                Verify your Garbo email address
            </title>
        </head>
        
        <body style="
            margin: 0;
            padding: 0;
            background-color: #f4f4f4;
            font-family: Arial, Helvetica, sans-serif;
            color: #1f2937;
        ">
        
            <!-- Main email background -->
            <table
                role="presentation"
                style="
                    width: 100%;
                    border-spacing: 0;
                    border-collapse: collapse;
                    background-color: #f4f4f4;
                "
            >
        
                <tr>
        
                    <td style="
                        padding: 40px 15px;
                        text-align: center;
                    ">
        
                        <!-- Email container -->
                        <table
                            role="presentation"
                            style="
                                width: 100%;
                                max-width: 600px;
                                margin: 0 auto;
                                border-spacing: 0;
                                border-collapse: separate;
                                background-color: #ffffff;
                                border-radius: 12px;
                                overflow: hidden;
                            "
                        >
        
                            <!-- Garbo Header -->
                            <tr>
        
                                <td style="
                                    padding: 32px 30px 20px;
                                    background-color: #ffffff;
                                    text-align: center;
                                ">
        
                                    <h1 style="
                                        margin: 0;
                                        font-size: 28px;
                                        color: #1f2937;
                                    ">
                                        Garbo Automated Email Services
                                    </h1>
        
                                </td>
        
                            </tr>
        
                            <!-- Email Content -->
                            <tr>
        
                                <td style="
                                    padding: 20px 40px 40px;
                                    text-align: left;
                                ">
        
                                    <h2 style="
                                        margin: 0 0 24px;
                                        text-align: center;
                                        font-size: 24px;
                                        color: #111827;
                                    ">
                                        Please verify your email address
                                    </h2>
        
                                    <p style="
                                        margin: 0 0 18px;
                                        font-size: 16px;
                                        line-height: 1.6;
                                    ">
                                        We want to say thanks for signing up
                                        and creating your Garbo account.
                                        Garbo is here to help you stay
                                        organized with your inbox.
                                    </p>
        
                                    <p style="
                                        margin: 0 0 28px;
                                        font-size: 16px;
                                        line-height: 1.6;
                                    ">
                                        Enter the verification code below
                                        to finish setting up your account:
                                    </p>
        
                                    <!-- Verification Code -->
                                    <div style="
                                        margin: 30px 0;
                                        text-align: center;
                                    ">
        
                                        <span style="
                                            display: inline-block;
                                            padding: 16px 28px;
                                            background-color: #f3f4f6;
                                            border-radius: 8px;
                                            font-size: 32px;
                                            font-weight: bold;
                                            letter-spacing: 8px;
                                            color: #111827;
                                        ">
                                            ${code}
                                        </span>
        
                                    </div>
        
                                    <p style="
                                        margin: 28px 0 12px;
                                        text-align: center;
                                        font-size: 14px;
                                        color: #6b7280;
                                    ">
                                        This code expires in
                                        <strong>10 minutes</strong>.
                                    </p>
        
                                    <p style="
                                        margin: 30px 0 0;
                                        font-size: 14px;
                                        line-height: 1.6;
                                        color: #6b7280;
                                    ">
                                        If you didn't create a Garbo account,
                                        you can safely ignore this email.
                                    </p>
        
                                </td>
        
                            </tr>
        
                            <!-- Footer -->
                            <tr>
        
                                <td style="
                                    padding: 25px 30px;
                                    border-top: 1px solid #e5e7eb;
                                    background-color: #f9fafb;
                                    text-align: center;
                                ">
        
                                    <p style="
                                        margin: 0 0 8px;
                                        font-size: 13px;
                                        color: #6b7280;
                                    ">
                                        © 2026 Garbo
                                    </p>
        
                                    <p style="
                                        margin: 0;
                                        font-size: 13px;
                                    ">
        
                                        <a
                                            href="https://www.thegarbagebot.com"
                                            style="
                                                color: #4b5563;
                                                text-decoration: none;
                                            "
                                        >
                                            thegarbagebot.com
                                        </a>
        
                                    </p>
        
                                </td>
        
                            </tr>
        
                        </table>
        
                    </td>
        
                </tr>
        
            </table>
        
        </body>
        
        </html>`.trim(),
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