// import bcrypt from "bcryptjs";
import * as crypto from "crypto";
import { prisma } from "../lib/prisma";
import type { Request, Response } from "express";
import { generate6DigitCode, hashCode, timingSafeEqualHex } from "../lib/verify-code";
import { sendVerificationEmail, sendUsernameRecoveryEmail } from "../lib/mailer";
import {hashPassword} from "../lib/password";

const CODE_TTL_MIN = 10;
const RESEND_MIN = 5;
const MAX_ATTEMPTS = 5;
const PASSWORD_RESET_TTL_MIN = 15;

type VerificationPurpose =

  | "SIGNUP"

  | "FORGOT_USERNAME"

  | "FORGOT_PASSWORD";

export async function signupHandler(req: Request, res: Response) {
  try {
    const { firstName, lastName, userName, eMail, password } = req.body as {
      firstName?: string;
      lastName?: string;
      userName?: string;
      eMail?: string;
      password?: string;
    };

    // Server-side validation (never trust browser)
    if (!firstName || firstName.length < 2 || firstName.length > 25) {
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

    if (!lastName || lastName.length < 3 || lastName.length > 25) {
      return res.status(400).json({
        error: "Invalid last name"
      });
    }

    if (!userName || userName.length < 5 || userName.length > 16) {
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
      where: { OR: [{ eMail: eMail }, { userName: userName }] },
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
        firstName: firstName,
        lastName: lastName,
        userName: userName,
        eMail: eMail,
        passwordHash: passwordHash,
        emailVerification: {
          create: {
            codeHash,
            expiresAt,
            resendAfter,
            purpose: "SIGNUP"
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

    // Prevents: FORGOT_PASSWORD code > /verify-email > accidentally verifies signup
    if (token.purpose !== "SIGNUP") {

      return res.status(400).json({

        error: "Invalid signup verification request."

      });

    }

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

    const {email, purpose} = req.body as {

      email?: string;

      purpose?: VerificationPurpose;

    };

    if (!email || !purpose) {

      return res.status(400).json({

        error:

          "Email and verification purpose are required."

      });

    }

    const allowedPurposes:

      VerificationPurpose[] = [

        "SIGNUP",

        "FORGOT_USERNAME",

        "FORGOT_PASSWORD"

      ];

    if (

      !allowedPurposes.includes(

        purpose

      )

    ) {

      return res.status(400).json({

        error:

          "Invalid verification purpose."

      });

    }

    const normalizedEmail =

      email.trim().toLowerCase();

    const user =

      await prisma.user.findUnique({

        where: {

          eMail: normalizedEmail

        },

        include: {

          emailVerification: true

        }

      });

    /*

     * Recovery requests should not reveal whether

     * the email belongs to a Garbo account.

     */

    if (!user) {

      if (

        purpose === "FORGOT_USERNAME" ||

        purpose === "FORGOT_PASSWORD"

      ) {

        return res.status(200).json({

          ok: true,

          message:

            "If the account exists, a new verification code has been sent."

        });

      }

      return res.status(404).json({

        error: "User not found."

      });

    }

    /*

     * Signup verification is unnecessary

     * after the email has already been verified.

     */

    if (

      purpose === "SIGNUP" &&

      user.emailVerified

    ) {

      return res.status(200).json({

        ok: true,

        message:

          "Email already verified."

      });

    }

    const now =

      new Date();

    const existing =

      user.emailVerification;

    /*

     * Regardless of verification purpose,

     * enforce the resend cooldown.

     */

    if (

      existing &&

      existing.resendAfter > now

    ) {

      return res.status(429).json({

        error:

          "Resend not available yet.",

        resendAvailableAt:

          existing.resendAfter.toISOString()

      });

    }

    const code =

      generate6DigitCode();

    const codeHash =

      hashCode(code);

    const expiresAt =

      new Date(

        now.getTime() +

        CODE_TTL_MIN *

        60_000

      );

    const resendAfter =

      new Date(

        now.getTime() +

        RESEND_MIN *

        60_000

      );

    await prisma.emailVerificationToken.upsert({

      where: {

        userId: user.id

      },

      create: {

        userId:

          user.id,

        codeHash,

        expiresAt,

        resendAfter,

        attemptCount: 0,

        purpose

      },

      update: {

        codeHash,

        expiresAt,

        resendAfter,

        attemptCount: 0,

        purpose

      }

    });

    await sendVerificationEmail(

      user.eMail,

      code

    );

    return res.status(200).json({

      ok: true,

      message:

        "A new verification code has been sent.",

      resendAvailableAt:

        resendAfter.toISOString()

    });

  } catch (err) {

    console.error(err);

    return res.status(500).json({

      error:

        "Unable to resend verification code."

    });

  }
}

// POST /api/auth/forgot-username
export async function forgotUsernameHandler(req: Request, res: Response) {
  try {
    const { email } = req.body as {
      email?: string;
    };

    if (!email) {
      return res.status(400).json({
        error: "Email is required."
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const user = await prisma.user.findUnique({
      where: {
        eMail: normalizedEmail
      },

      select: {
        id: true,
        eMail: true
      }
    });

    /*
     * Do not tell an unauthenticated visitor whether
     * the email exists in Garbo.
     */
    if (!user) {
      return res.status(200).json({
        ok: true,
        message:
          "If an account exists for this email, a verification code has been sent."
      });
    }

    const code = generate6DigitCode();
    const codeHash = hashCode(code);

    const now = new Date();

    const expiresAt = new Date(
      now.getTime() +
      CODE_TTL_MIN * 60_000
    );

    const resendAfter = new Date(
      now.getTime() +
      RESEND_MIN * 60_000
    );

    await prisma.emailVerificationToken.upsert({
      where: {
        userId: user.id
      },

      create: {
        userId: user.id,
        codeHash,
        expiresAt,
        resendAfter,
        attemptCount: 0,
        purpose: "FORGOT_USERNAME"
      },

      update: {
        codeHash,
        expiresAt,
        resendAfter,
        attemptCount: 0,
        purpose: "FORGOT_USERNAME"
      }
    });

    await sendVerificationEmail(
      user.eMail,
      code
    );

    return res.status(200).json({
      ok: true,

      message:
        "If an account exists for this email, a verification code has been sent.",

      resendAvailableAt:
        resendAfter.toISOString()
    });

  } catch (err) {

    console.error(err);

    return res.status(500).json({
      error:
        "Unable to process username recovery."
    });
  }
}

// POST /api/auth/forgot-username/verify
export async function verifyForgotUsernameHandler(req: Request, res: Response) {
  try {

    const { email, code } = req.body as {
      email?: string;
      code?: string;
    };

    if (!email || !code) {

      return res.status(400).json({
        error: "Email and verification code are required."
      });

    }

    const normalizedEmail = email.trim().toLowerCase();

    const user = await prisma.user.findUnique({

      where: { eMail: normalizedEmail },

      select: {
        id: true,
        eMail: true,
        userName: true,
        emailVerification: true
      }
    });


    if (!user || !user.emailVerification) {

      return res.status(400).json({
        error: "Invalid or expired verification request."
      });

    }


    const token = user.emailVerification;


    // Make sure this code was actually issued
    // for username recovery.
    if (token.purpose !== "FORGOT_USERNAME") {

      return res.status(400).json({
        error: "Invalid verification request."
      });
    }


    if (
      token.attemptCount >=
      MAX_ATTEMPTS
    ) {

      return res.status(429).json({
        error: "Too many attempts. Please request a new code."
      });
    }


    const now = new Date();


    if (token.expiresAt <= now) {

      return res.status(400).json({
        error: "Verification code expired. Please request a new code."
      });
    }


    const incomingHash = hashCode(code.trim());

    // timingSafeEqualHex comes from lib/verify-code.ts
    const match = timingSafeEqualHex(incomingHash, token.codeHash);


    if (!match) {

      await prisma.emailVerificationToken.update({

        where: { id: token.id },

        data: { attemptCount: { increment: 1 } }
      });


      return res.status(400).json({
        error: "Invalid verification code."
      });
    }


    /*
     * Verification succeeded.
     *
     * Send the username to the account's
     * registered email address.
     */
    await sendUsernameRecoveryEmail(
      user.eMail,
      user.userName
    );


    /*
     * The EVC has now served its purpose.
     */
    await prisma.emailVerificationToken.delete({

      where: {
        userId: user.id
      }

    });


    return res.status(200).json({

      ok: true,

      message:
        "Your username has been sent to your email."
    });

  } catch (err) {

    console.error(err);

    return res.status(500).json({
      error:
        "Unable to verify username recovery."
    });
  }
}

// POST /api/auth/forgot-password
export async function forgotPasswordHandler(req: Request, res: Response) {
  try {

    const { email } =
      req.body as {
        email?: string;
      };


    if (!email) {

      return res.status(400).json({
        error:
          "Email is required."
      });
    }


    const normalizedEmail =
      email.trim().toLowerCase();


    const user =
      await prisma.user.findUnique({

        where: {
          eMail: normalizedEmail
        },

        select: {
          id: true,
          eMail: true
        }
      });


    /*
     * Prevent account enumeration.
     */
    if (!user) {

      return res.status(200).json({

        ok: true,

        message:
          "If an account exists for this email, a verification code has been sent."
      });
    }


    const code =
      generate6DigitCode();


    const codeHash =
      hashCode(code);


    const now =
      new Date();


    const expiresAt =
      new Date(
        now.getTime() +
        CODE_TTL_MIN * 60_000
      );


    const resendAfter =
      new Date(
        now.getTime() +
        RESEND_MIN * 60_000
      );


    await prisma.emailVerificationToken.upsert({

      where: {
        userId: user.id
      },

      create: {

        userId: user.id,

        codeHash,

        expiresAt,

        resendAfter,

        attemptCount: 0,

        purpose:
          "FORGOT_PASSWORD"
      },

      update: {

        codeHash,

        expiresAt,

        resendAfter,

        attemptCount: 0,

        purpose:
          "FORGOT_PASSWORD"
      }
    });


    await sendVerificationEmail(
      user.eMail,
      code
    );


    return res.status(200).json({

      ok: true,

      message:
        "If an account exists for this email, a verification code has been sent.",

      resendAvailableAt:
        resendAfter.toISOString()
    });

  } catch (err) {

    console.error(err);

    return res.status(500).json({

      error:
        "Unable to process password recovery."
    });
  }
}

// Verify forgotten password code
export async function verifyForgotPasswordHandler(req: Request, res: Response) {
  try {

    const {
      email,
      code
    } = req.body as {
      email?: string;
      code?: string;
    };


    if (!email || !code) {

      return res.status(400).json({
        error:
          "Email and verification code are required."
      });
    }


    const normalizedEmail =
      email.trim().toLowerCase();


    const user =
      await prisma.user.findUnique({

        where: {
          eMail: normalizedEmail
        },

        select: {
          id: true,
          emailVerification: true
        }
      });


    if (
      !user ||
      !user.emailVerification
    ) {

      return res.status(400).json({
        error:
          "Invalid or expired verification request."
      });
    }


    const verification =
      user.emailVerification;


    if (
      verification.purpose !==
      "FORGOT_PASSWORD"
    ) {

      return res.status(400).json({
        error:
          "Invalid verification request."
      });
    }


    if (
      verification.attemptCount >=
      MAX_ATTEMPTS
    ) {

      return res.status(429).json({
        error:
          "Too many attempts. Please request a new code."
      });
    }


    const now =
      new Date();


    if (
      verification.expiresAt <=
      now
    ) {

      return res.status(400).json({
        error:
          "Verification code expired. Please request a new code."
      });
    }


    const incomingHash =
      hashCode(
        code.trim()
      );


    const match =
      timingSafeEqualHex(
        incomingHash,
        verification.codeHash
      );


    if (!match) {

      await prisma.emailVerificationToken.update({

        where: {
          id: verification.id
        },

        data: {

          attemptCount: {
            increment: 1
          }
        }
      });


      return res.status(400).json({
        error:
          "Invalid verification code."
      });
    }


    /*
     * Generate a cryptographically secure
     * password-reset token.
     */
    const resetToken =
      crypto
        .randomBytes(32)
        .toString("hex");


    /*
     * Never store the raw reset token.
     */
    const resetTokenHash =
      hashCode(resetToken);


    const resetExpiresAt =
      new Date(
        now.getTime() +
        PASSWORD_RESET_TTL_MIN *
        60_000
      );


    /*
     * Remove old unused reset tokens for
     * this user before creating another.
     */
    await prisma.pWResetToken.deleteMany({

      where: {

        userId: user.id,

        usedAt: null
      }
    });


    await prisma.pWResetToken.create({

      data: {

        userId:
          user.id,

        tokenHash:
          resetTokenHash,

        expiresAt:
          resetExpiresAt
      }
    });


    /*
     * EVC cannot be reused after successful
     * verification.
     */
    await prisma.emailVerificationToken.delete({

      where: {
        userId: user.id
      }
    });


    return res.status(200).json({

      ok: true,

      verified: true,

      resetToken,

      resetTokenExpiresAt:
        resetExpiresAt.toISOString(),

      message:
        "Email verified. You may now create a new password."
    });

  } catch (err) {

    console.error(err);

    return res.status(500).json({

      error:
        "Unable to verify password recovery."
    });
  }
}

// POST /api/auth/reset-password
export async function resetPasswordHandler(req: Request, res: Response) {
  try {

    const {
      resetToken,
      password
    } = req.body as {
      resetToken?: string;
      password?: string;
    };


    if (
      !resetToken ||
      !password
    ) {

      return res.status(400).json({
        error:
          "Reset token and new password are required."
      });
    }


    /*
     * Use your same password rules from signup.
     *
     * You can make this stricter later by moving
     * password validation into one reusable helper.
     */
    if (
      password.length < 8 ||
      password.length > 64
    ) {

      return res.status(400).json({
        error:
          "Invalid password."
      });
    }


    const tokenHash =
      hashCode(
        resetToken.trim()
      );


    const reset =
      await prisma.pWResetToken.findUnique({

        where: {
          tokenHash
        }
      });


    if (!reset) {

      return res.status(400).json({
        error:
          "Invalid password reset request."
      });
    }


    if (reset.usedAt) {

      return res.status(400).json({
        error:
          "This password reset token has already been used."
      });
    }


    const now =
      new Date();


    if (
      reset.expiresAt <=
      now
    ) {

      return res.status(400).json({
        error:
          "Password reset request has expired."
      });
    }


    const passwordHash =
      await hashPassword(
        password
      );


    /*
     * Password update and token invalidation
     * happen atomically.
     */
    await prisma.$transaction([

      prisma.user.update({

        where: {
          id: reset.userId
        },

        data: {

          passwordHash,

          passwordUpdatedAt:
            now
        }
      }),


      prisma.pWResetToken.update({

        where: {
          id: reset.id
        },

        data: {
          usedAt: now
        }
      })
    ]);


    return res.status(200).json({

      ok: true,

      message:
        "Password successfully updated. Please log in."
    });

  } catch (err) {

    console.error(err);

    return res.status(500).json({

      error:
        "Unable to reset password."
    });
  }
}