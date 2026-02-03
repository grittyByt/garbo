import type { Request, Response } from "express";
// import bcrypt from "bcryptjs";
import { prisma } from "../lib/prisma";
import { generate6DigitCode, hashCode, timingSafeEqualHex } from "../lib/verify-code";
import { sendVerificationEmail } from "../lib/mailer";
import {hashPassword} from "../lib/password";

const CODE_TTL_MIN = 10;
const RESEND_MIN = 5;
const MAX_ATTEMPTS = 5;

export async function signupHandler(req: Request, res: Response) {
  try {
    const { fName, lName, uName, age, eMail, password } = req.body ?? {};

    // Server-side validation (never trust browser)
    if (!fName || fName.length < 2 || fName.length > 25) {
      // 400 = Bad request
      /*
       * The server cannot or will not process the request due to something that is
       *  perceived to be a client error (e.g., malformed request syntax, invalid request
       *  message framing, or deceptive request routing).
      */
      return res.status(400).json({
        error: "Invalid first name"
      });
    }

    if (!lName || lName.length < 3 || lName.length > 25) {
      return res.status(400).json({
        error: "Invalid last name"
      });
    }

    if (!age || age <= 15 || age >= 125) {
      return res.status(400).json({
        error: "Invalid age"
      });
    }

    if (!uName || uName.length < 5 || uName.length > 16) {
      return res.status(400).json({
        error: "Invalid username"
      });
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!eMail || !emailRegex.test(eMail)) {
      return res.status(400).json({
        error: "Invalid email"
      });
    }
    if (!password || password.length < 8 || password.length > 64) {
      return res.status(400).json({
        error: "Invalid password"
      });
    }


    // Check uniqueness (depending on your schema unique constraints)
    const userExist = await prisma.user.findFirst({
      where: { OR: [{ eMail: eMail }, { userName: uName }] },
      // this allows Prisma to work and sort faster by producing only the id associated
      // with the particular user
      select: { id: true },
    });

    if (userExist) {
      // 409 = Conflict
      // This response is sent when a request conflicts with the current state of the server.
      return res.status(409).json({
        error: "Email or username already in use"
      });
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Email verification code set up
    const code = generate6DigitCode();
    const codeHash = hashCode(code);
    const now = new Date();
    const expiresAt = new Date(now.getTime() + CODE_TTL_MIN * 60_000);
    const resendAfter = new Date(now.getTime() + RESEND_MIN * 60_000);


    // Create user
    const welcomeUser = await prisma.user.create({
      data: {
        firstName: fName,
        lastName: lName,
        userName: uName,
        eMail: eMail,
        passwordHash: passwordHash,
        emailVerification: {
          create: {
            codeHash,
            expiresAt,
            resendAfter
          },
        },
      },
      select: { id: true, firstName: true, lastName: true, userName: true, eMail: true, emailVerification: true, createdAt: true },
    });

    await sendVerificationEmail(welcomeUser.eMail, code);




    // 201 = Created
    /*
    * successful response status code indicates that the HTTP request has led to
    * the creation of a resource.
    */
    return res.status(201).json({
      ok: true,
      needsEmailVerification: true,
      email: welcomeUser.eMail,
      resendAvailableAt: resendAfter.toISOString(),
    });
  } catch (err) {
    console.error(err);
    // 500 = Internal Server Issue
    /*
    * server error response status code indicates that the server encountered an
    * unexpected condition that prevented it from fulfilling the request.
    * */
    return res.status(500).json({ error: "Server error" });
  }
}

export async function verifyEmailHandler(req: Request, res: Response) {
  try {
    const { email, code } = req.body as { email: string; code: string };

    if (!email || !code) return res.status(400).json({ error: "Email and code are required." });

    /* search within the User model for the eMail column and select these other
    * columns that share the same rows as the email entered by the user
    * */
    const user = await prisma.user.findUnique({
      where: { eMail: email.trim().toLowerCase() },
      select: { id: true, emailVerified: true, emailVerification: true },
    });

    /* let us verify that the user email input is not blank and check that the email has not already
    * been verified */
    if (!user) return res.status(404).json({ error: "User not found." });
    if (user.emailVerified) return res.json({ ok: true, message: "Email already verified." });

    /* once we know the user email input is not blank and the email has not already been verified
    * we create a token*/
    const token = user.emailVerification;
    if (!token) return res.status(400).json({ error: "No verification token found. Resend code." });

    // lockout attempts
    // if too many tokens are generated system will flag this as a reason to lockout the user for a time period
    if (token.attemptCount >= MAX_ATTEMPTS) {
      return res.status(429).json({ error: "Too many attempts. Please resend a new code." });
    }

    const now = new Date();
    if (token.expiresAt <= now) {
      return res.status(400).json({ error: "Code expired. Please resend a new code." });
    }

    const incomingHash = hashCode(code.trim());
    const match = timingSafeEqualHex(incomingHash, token.codeHash);

    if (!match) {
      await prisma.emailVerificationToken.update({
        where: { id: token.id },
        data: { attemptCount: { increment: 1 } },
      });
      return res.status(400).json({ error: "Invalid code. Please try again." });
    }

    // Verified ✅
    await prisma.$transaction([
      prisma.user.update({
        where: { id: user.id },
        data: { emailVerified: true, emailVerifiedAt: new Date() },
      }),
      prisma.emailVerificationToken.delete({ where: { userId: user.id } }),
    ]);

    return res.json({ ok: true, verified: true });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server error. Please try again." });
  }
}

export async function resendVerificationHandler(req: Request, res: Response) {
  try {
    const { email } = req.body as { email: string };
    if (!email) return res.status(400).json({ error: "Email is required." });

    const user = await prisma.user.findUnique({
      where: { eMail: email.trim().toLowerCase() },
      include: { emailVerification: true },
    });

    if (!user) return res.status(404).json({ error: "User not found." });
    if (user.emailVerified) return res.json({ ok: true, message: "Email already verified." });

    const now = new Date();
    const existing = user.emailVerification;

    if (existing && existing.resendAfter > now) {
      return res.status(429).json({
        error: "Resend not available yet.",
        resendAvailableAt: existing.resendAfter.toISOString(),
      });
    }

    const code = generate6DigitCode();
    const codeHash = hashCode(code);
    const expiresAt = new Date(now.getTime() + CODE_TTL_MIN * 60_000);
    const resendAfter = new Date(now.getTime() + RESEND_MIN * 60_000);

    await prisma.emailVerificationToken.upsert({
      where: { userId: user.id },
      create: { userId: user.id, codeHash, expiresAt, resendAfter, attemptCount: 0 },
      update: { codeHash, expiresAt, resendAfter, attemptCount: 0 },
    });

    await sendVerificationEmail(user.eMail, code);

    return res.json({ ok: true, resendAvailableAt: resendAfter.toISOString() });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server error. Please try again." });
  }
}