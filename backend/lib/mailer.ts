import nodemailer = require("nodemailer");

export const mailer = nodemailer.createTransport({
  host: process.env.SMTP_HOST!,
  port: Number(process.env.SMTP_PORT ?? 587),
  secure: false,
  auth: {
    user: process.env.SMTP_USER!,
    pass: process.env.SMTP_PASS!,
  },
});

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
  await mailer.sendMail({
    from: process.env.MAIL_FROM ?? `"${appName}" <no-reply@garbo.app>`,
    to,
    subject: `Your ${appName} verification code`,
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

export async function sendUsernameRecoveryEmail(
    email: string,
    username: string
) {

  const appName = "Garbo";

  try {

    const safeUsername = escapeHtml(username);

    await mailer.sendMail({

      from: process.env.EMAIL_FROM ?? `"${appName}" <no-reply@garbo.app>`,

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

            You recently requested help recovering your

            ${appName} username.

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

              style="

                font-size: 24px;

              "

            >

              ${safeUsername}

            </strong>

          </div>

          <p>

            You can now return to ${appName} and log in

            using this username.

          </p>

          <p>

            If you did not request your username,

            you can safely ignore this email.

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