// import bcrypt from "bcryptjs";
import * as crypto from "crypto";
import { prisma } from "../lib/prisma";
import type { Request, Response } from "express";
import { generate6DigitCode, hashCode, timingSafeEqualHex } from "../lib/verify-code";
import { sendVerificationEmail, sendUsernameRecoveryEmail } from "../lib/mailer";
import {hashPassword} from "../lib/password";

// First punishment after max failed attempts
const INITIAL_LOCKOUT_MINUTES = 5;
// How long the code itself is valid
const VERIFICATION_CODE_EXPIRATION_MINUTES = 10;
// How soon a normal resend is allowed
const RESEND_MIN = 5;
const MAX_VERIFICATION_ATTEMPTS = 5;
const PASSWORD_RESET_TTL_MIN = 15;
const PENDING_USER_LIFETIME_MS = 36 * 60 * 60 * 1000;
// How much subsequent punishments increase
const LOCKOUT_INCREMENT_MINUTES = 30;

function calculateLockoutMinutes(previousLockoutCount: number): number {
  return (
    INITIAL_LOCKOUT_MINUTES +
    previousLockoutCount * LOCKOUT_INCREMENT_MINUTES
  );
}



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
    const normalizedEmail = eMail.trim().toLowerCase();

    if (!password || password.length < 8 || password.length > 64) {
      return res.status(400).json({
        error: "Invalid password"
      });
    }


    // Check uniqueness (depending on your schema unique constraints)
    const userExist = await prisma.user.findFirst({
      where: { OR: [{ eMail: normalizedEmail }, { userName }] },
      // this allows Prisma to work and sort faster by producing only the id associated
      // with the particular user
      select: { id: true },
    });

    if (userExist) {
      // 409 = Conflict
      // This response is sent when a request conflicts with the current state of the server.
      return res.status(409).json({
        error: "Email or username is already in use"
      });
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Email verification code set up
    const code = generate6DigitCode();
    const codeHash = hashCode(code);
    const now = new Date();
    const expiresAt = new Date(now.getTime() + PENDING_USER_LIFETIME_MS);
    const resendAfter = new Date(now.getTime() + RESEND_MIN * 60_000);

    const pendingConflict = await prisma.userPendingSignup.findFirst({

        where: { userName, NOT: { eMail: normalizedEmail } },

        select: { id: true }

      });

    if (pendingConflict) {
      return res.status(409).json({ error: "Username is already in use." });
    }


    // Pending User Creation
    const pendingUser = await prisma.userPendingSignup.upsert({

        where: { eMail: normalizedEmail },

        update: {
          firstName,
          lastName,
          userName,
          passwordHash
        },

        create: {
          firstName,
          lastName,
          userName,
          eMail: normalizedEmail,
          passwordHash,
          expiresAt
        },

    });
    // Create user
    // const welcomeUser = await prisma.user.create({
    //   data: {
    //     firstName: firstName,
    //     lastName: lastName,
    //     userName: userName,
    //     eMail: eMail,
    //     passwordHash: passwordHash,
    //     emailVerification: {
    //       create: {
    //         codeHash,
    //         expiresAt,
    //         resendAfter,
    //         purpose: "SIGNUP"
    //       },
    //     },
    //   },
    //   select: { id: true, firstName: true, lastName: true, userName: true, eMail: true, emailVerification: true, createdAt: true },
    // });
    await prisma.emailVerificationToken.upsert({

        where: { pendingSignupId: pendingUser.id },

        update: {
            purpose: "SIGNUP",
            codeHash,
            expiresAt,
            resendAfter,
            attemptCount: 0,
        },
        create: {
            purpose: "SIGNUP",
            codeHash,
            expiresAt,
            resendAfter,
            attemptCount: 0,

            pendingSignup: {
                connect: {
                    id: pendingUser.id
                }
            }
        },



    });

    await sendVerificationEmail(pendingUser.eMail, code);




    // 201 = Created
    /*
    * successful response status code indicates that the HTTP request has led to
    * the creation of a resource.
    */
    return res.status(201).json({
      ok: true,
      needsEmailVerification: true,
      email: pendingUser.eMail,
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
        const { email, code } = req.body as {
            email: string;
            code: string;
        };

        if (!email || !code) {
            return res.status(400).json({
                error: "Email and verifier passcode are required.",
            });
        }

        const normalizedEmail = email.trim().toLowerCase();

        // Find the pending signup, not User.
        const pending = await prisma.userPendingSignup.findUnique({
            where: {
                eMail: normalizedEmail,
            },
            include: {
                emailVerification: true,
            },
        });

        if (!pending) {
            return res.status(404).json({
                error: "Pending signup not found.",
            });
        }

        const now = new Date();

        if (pending.expiresAt <= now) {
            await prisma.userPendingSignup.delete({
                where: { id: pending.id },
            });

            return res.status(410).json({
                error: "Your signup has expired. Please create your account again.",
            });
        }

        const token = pending.emailVerification;

        if (!token) {
            return res.status(400).json({
                error: "No verification token found.  Resend verifier passcode.",
            });
        }

        if (token.purpose !== "SIGNUP") {
            return res.status(400).json({
                error: "Invalid signup verification request.",
            });
        }

        if (pending.lockedUntil && pending.lockedUntil > now) {
            const remainingMs =
                pending.lockedUntil.getTime() - now.getTime();

            const remainingMinutes = Math.ceil(remainingMs / 60_000);

            return res.status(429).json({
                error:
                    `Too many failed attempts. Please wait ${remainingMinutes} ` +
                    `minute(s) before requesting another verifier passcode.`,
                lockedUntil: pending.lockedUntil,
            });
        }


        if (token.expiresAt <= now) {
            return res.status(400).json({
                error: "Code has expired. Please resend a new verifier passcode.",
            });
        }

        const incomingHash = hashCode(code.trim());

        const match = timingSafeEqualHex(
            incomingHash,
            token.codeHash,
        );

        if (!match) {
            const newAttemptCount = token.attemptCount + 1;

            // User has reached the maximum attempts
            if (newAttemptCount >= MAX_VERIFICATION_ATTEMPTS) {

                const lockoutMinutes = calculateLockoutMinutes(
                    pending.lockoutCount
                );

                const lockedUntil = new Date(
                    Date.now() + lockoutMinutes * 60 * 1000
                );

                await prisma.$transaction([
                    prisma.emailVerificationToken.update({
                        where: {id: token.id},
                        data: {attemptCount: newAttemptCount},
                    }),

                    prisma.userPendingSignup.update({
                        where: { id: pending.id },
                        data: {
                            lockoutCount: {increment: 1},
                            lockedUntil,
                        },
                    }),
                ]);

                return res.status(429).json({
                    error:
                        `Too many failed attempts. You must wait ${lockoutMinutes} ` +
                        `minute(s) before requesting another verifier passcode.`,
                    lockedUntil,
                });
            }


            // Incorrect, but they still have attempts remaining
            await prisma.emailVerificationToken.update({
                where: {
                    id: token.id,
                },
                data: {
                    attemptCount: newAttemptCount,
                },
            });

            const attemptsRemaining =
                MAX_VERIFICATION_ATTEMPTS - newAttemptCount;

            return res.status(400).json({
                error:
                    `Invalid verifier passcode. ` +
                    `${attemptsRemaining} attempt(s) remaining.`,
            });
        }

        // Verification succeeded.
        // NOW create the permanent account.
        const newUser = await prisma.$transaction(async (tx) => {

            const conflict = await tx.user.findFirst({

                where: { OR: [{ eMail: pending.eMail },{ userName: pending.userName }] },

                select: { id: true }

              });

            if (conflict) {
                throw new Error("EMAIL_OR_USERNAME_CONFLICT");
            }

            const createdUser = await tx.user.create({

                data: {
                    firstName: pending.firstName,
                    lastName: pending.lastName,
                    userName: pending.userName,
                    eMail: pending.eMail,
                    passwordHash: pending.passwordHash,
                    // Since the account is only created after
                    // successful verification:
                    emailVerified: true,
                    emailVerifiedAt: new Date(),
                },
                select: {

                  publicId: true,
                  firstName: true,
                  lastName: true,
                  userName: true,
                  eMail: true,
                  createdAt: true
                }
            });

            await tx.userPendingSignup.delete({
                where: { id: pending.id }
            });

            return createdUser;

        });

        return res.status(201).json({
            ok: true,
            verified: true,
            accountCreated: true,
            user: newUser,
            message: "Email verified. Account created successfully.",
        });

    } catch (err) {

        if (err instanceof Error && err.message === "EMAIL_OR_USERNAME_CONFLICT") {

          return res.status(409).json({

            error: "Email or username became unavailable before verification completed."

          });

        }

        console.error("VERIFY EMAIL ERROR:", err);
        return res.status(500).json({ error: "Server error. Please try again." });
    }
}

export async function resendVerificationHandler(req: Request, res: Response) {
  try {
    const { email, purpose } = req.body as {
      email?: string;
      purpose?: VerificationPurpose;
    };

    if (!email || !purpose) {
      return res.status(400).json({
        error: "Email and verification purpose are required."
      });
    }

    const allowedPurposes: VerificationPurpose[] = [
      "SIGNUP",
      "FORGOT_USERNAME",
      "FORGOT_PASSWORD"
    ];

    if (!allowedPurposes.includes(purpose)) {
      return res.status(400).json({
        error: "Invalid verification purpose."
      });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const now = new Date();

    /*
     * ============================
     * SIGNUP VERIFICATION
     * ============================
     */
    if (purpose === "SIGNUP") {

      const pendingUser =
        await prisma.userPendingSignup.findUnique({
          where: {
            eMail: normalizedEmail
          },
          include: {
            emailVerification: true
          }
        });

      // Pending signup does not exist.
      if (!pendingUser) {
        return res.status(404).json({
          error: "Pending signup not found."
        });
      }

      /*
       * Check whether the entire pending signup
       * has exceeded its 36-hour lifetime.
       */
      if (pendingUser.expiresAt <= now) {

        await prisma.userPendingSignup.delete({
          where: {
            id: pendingUser.id
          }
        });

        return res.status(410).json({
          error:
            "Your signup has expired. Please create your account again."
        });
      }

      /*
       * Check whether the user is currently locked
       * out because they exceeded the maximum
       * verification attempts.
       */
      if (
        pendingUser.lockedUntil &&
        pendingUser.lockedUntil > now
      ) {

        const remainingMs =
          pendingUser.lockedUntil.getTime() -
          now.getTime();

        const remainingMinutes =
          Math.ceil(remainingMs / 60_000);

        return res.status(429).json({
          error:
            `Too many failed verification attempts. ` +
            `Please wait ${remainingMinutes} minute(s) ` +
            `before requesting another verifier passcode.`,

          resendAvailableAt:
            pendingUser.lockedUntil.toISOString()
        });
      }

      const existing =
        pendingUser.emailVerification;

      /*
       * Normal resend cooldown.
       */
      if (
        existing &&
        existing.resendAfter > now
      ) {
        return res.status(429).json({
          error: "Resend not available yet.",

          resendAvailableAt:
            existing.resendAfter.toISOString()
        });
      }

      /*
       * All checks have passed.
       * NOW generate the new verification code.
       */

      const code = generate6DigitCode();

      const codeHash = hashCode(code);

      const expiresAt = new Date(
        now.getTime() +
        VERIFICATION_CODE_EXPIRATION_MINUTES * 60_000
      );

      const resendAfter = new Date(now.getTime() + RESEND_MIN * 60_000);

      /*
       * Replace the previous verification code
       * or create one if none currently exists.
       */

      await prisma.emailVerificationToken.upsert({
        where: {
          pendingSignupId: pendingUser.id
        },

        update: {
          purpose: "SIGNUP",
          codeHash,
          expiresAt,
          resendAfter,

          // New code gets a fresh set of attempts.
          attemptCount: 0
        },

        create: {
          purpose: "SIGNUP",
          codeHash,
          expiresAt,
          resendAfter,
          attemptCount: 0,

          pendingSignup: {
            connect: {
              id: pendingUser.id
            }
          }
        }
      });

      /*
       * The previous lockout has elapsed.
       *
       * Clear lockedUntil but DO NOT reset
       * lockoutCount.
       */

      if (pendingUser.lockedUntil) {
        await prisma.userPendingSignup.update({
          where: {
            id: pendingUser.id
          },

          data: {
            lockedUntil: null
          }
        });
      }

      /*
       * Send the newly generated code.
       */
      await sendVerificationEmail(pendingUser.eMail, code);

      return res.status(200).json({
        ok: true,

        message: "A new verification code has been sent.",

        resendAvailableAt: resendAfter.toISOString()
      });
    }


    /*
     * ============================
     * ACCOUNT RECOVERY
     * ============================
     */

    const user = await prisma.user.findUnique({
      where: { eMail: normalizedEmail },

      include: { emailVerification: true }
    });


    if (!user) {
      return res.status(200).json({
        ok: true,

        message:
          "If the account exists, a new verification code has been sent."
      });
    }

    /*
     * Find the existing token for the
     * requested recovery purpose.
     */

    const existing = user.emailVerification.find(
      (token) => token.purpose === purpose
    );

    /*
     * Respect the normal resend cooldown.
     *
     * We still return a generic response so we
     * don't expose information about the account.
     */
    if (
      existing &&
      existing.resendAfter > now
    ) {
      return res.status(200).json({
        ok: true,

        message:
          "If the account exists, a verification code has been sent."
      });
    }

    /*
     * All account-recovery checks have passed.
     *
     * NOW generate the new verification code.
     */

    const code = generate6DigitCode();

    const codeHash = hashCode(code);

    const expiresAt = new Date(
      now.getTime() +
      VERIFICATION_CODE_EXPIRATION_MINUTES * 60_000
    );

    const resendAfter = new Date(
      now.getTime() +
      RESEND_MIN * 60_000
    );

    await prisma.emailVerificationToken.upsert({
      where: {
        userId_purpose: {
          userId: user.id,
          purpose
        }
      },

      update: {
        purpose,
        codeHash,
        expiresAt,
        resendAfter,
        attemptCount: 0
      },

      create: {
        purpose,
        codeHash,
        expiresAt,
        resendAfter,
        attemptCount: 0,

        user: {
          connect: {
            id: user.id
          }
        }
      }
    });

    await sendVerificationEmail(
      user.eMail,
      code
    );

    return res.status(200).json({
      ok: true,

      message:
        "If the account exists, a new verification code has been sent.",

      resendAvailableAt:
        resendAfter.toISOString()
    });

  } catch (err) {

    console.error(
      "RESEND VERIFICATION ERROR:",
      err
    );

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
      INITIAL_LOCKOUT_MINUTES * 60_000
    );

    const resendAfter = new Date(
      now.getTime() +
      RESEND_MIN * 60_000
    );

    await prisma.emailVerificationToken.upsert({
      where: {
          userId_purpose: {
              userId: user.id,
              purpose: "FORGOT_USERNAME"
          }
      },

      create: {
        purpose: "FORGOT_USERNAME",
        codeHash,
        expiresAt,
        resendAfter,
        attemptCount: 0,

        user: {
            connect: {
                id: user.id
            }
        }
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

      message: "If an account exists for this email, a verification code has been sent.",

      resendAvailableAt: resendAfter.toISOString()
    });

  } catch (err) {

    console.error(err);

    return res.status(500).json({
      error: "Unable to process username recovery."
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

        emailVerification: {
            select: {
                id: true,
                purpose: true,
                codeHash: true,
                expiresAt: true,
                resendAfter: true,
                attemptCount: true
            }
        }
      }
    });


    if (!user) {
      return res.status(400).json({
        error: "Invalid or expired verification request."
      });
    }

    const forgottenUserToken = user.emailVerification.find(
        (verification) => verification.purpose === "FORGOT_USERNAME"
    );


    // Make sure this code was actually issued
    // for username recovery.
    if (!forgottenUserToken) {
      return res.status(400).json({error: "Invalid or expired verification request."});
    }


    if (forgottenUserToken.attemptCount >= MAX_VERIFICATION_ATTEMPTS) {

      return res.status(429).json({
        error: "Too many attempts. Please request a new code."
      });
    }

    const now = new Date();

    if (forgottenUserToken.expiresAt <= now) {

      return res.status(400).json({
        error: "Verification code expired. Please request a new code."
      });
    }

    const incomingHash = hashCode(code.trim());

    // timingSafeEqualHex comes from lib/verify-code.ts
    const match = timingSafeEqualHex(incomingHash, forgottenUserToken.codeHash);

    if (!match) { await prisma.emailVerificationToken.update({

        where: { id: forgottenUserToken.id },

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
        id: forgottenUserToken.id
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
        INITIAL_LOCKOUT_MINUTES * 60_000
      );


    const resendAfter =
      new Date(
        now.getTime() +
        RESEND_MIN * 60_000
      );


    await prisma.emailVerificationToken.upsert({

      where: {
          userId_purpose: {
              userId: user.id,
              purpose: "FORGOT_PASSWORD"
          }
      },

      create: {

          purpose: "FORGOT_PASSWORD",
          codeHash,
          expiresAt,
          resendAfter,
          attemptCount: 0,

          user: { connect: { id: user.id } }
      },

      update: {
        codeHash,
        expiresAt,
        resendAfter,
        attemptCount: 0,
        purpose: "FORGOT_PASSWORD"
      }
    });


    await sendVerificationEmail(
      user.eMail,
      code
    );


    return res.status(200).json({

      ok: true,
      message: "If an account exists for this email, a verification code has been sent.",
      resendAvailableAt: resendAfter.toISOString()
    });

  } catch (err) {

    console.error(err);

    return res.status(500).json({

      error: "Unable to process password recovery."
    });
  }
}

// Verify forgotten password code
export async function verifyForgotPasswordHandler(req: Request, res: Response) {
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
            emailVerification: {
                select: {
                    id: true,
                    purpose: true,
                    codeHash: true,
                    expiresAt: true,
                    resendAfter: true,
                    attemptCount: true
                }
            } }

      });


    if (!user) {
      return res.status(400).json({ error: "Invalid or expired verification request." });
    }


    /*

     * emailVerification is one-to-many,

     * so locate the FORGOT_PASSWORD token.

     */

    const forgottenPasswordToken =

      user.emailVerification.find((token) => token.purpose === "FORGOT_PASSWORD");

    if (!forgottenPasswordToken) {

      return res.status(400).json({ error: "Invalid or expired verification request." });

    }

    /*
     * Prevent additional attempts once the
     * maximum number has been reached.
     */

    if (forgottenPasswordToken.attemptCount >= MAX_VERIFICATION_ATTEMPTS) {

      return res.status(429).json({

        error: "Too many attempts. Please request a new code."

      });

    }

    const now = new Date();

    /*

     * Make sure the verification code has

     * not expired.

     */

    if (forgottenPasswordToken.expiresAt <= now) {

      return res.status(400).json({

        error: "Verification code expired. Please request a new code."

      });

    }

    const incomingHash = hashCode(code.trim());

    const match = timingSafeEqualHex(incomingHash, forgottenPasswordToken.codeHash);

    /*

     * Incorrect code.

     *

     * Increment only this verification token's

     * attempt count.

     */

    if (!match) {

      await prisma.emailVerificationToken.update({

        where: { id: forgottenPasswordToken.id },

        data: { attemptCount: { increment: 1 } }

      });

      return res.status(400).json({ error: "Invalid verification code." });

    }

    /*

     * Email verification succeeded.

     *

     * Generate a cryptographically secure

     * password-reset token.

     */

    const resetToken = crypto.randomBytes(32).toString("hex");

    /*

     * Never store the raw reset token.

     */

    const resetTokenHash = hashCode(resetToken);

    const resetExpiresAt = new Date(now.getTime() + PASSWORD_RESET_TTL_MIN * 60_000);

    /*

     * Remove old unused reset tokens for

     * this user before creating another.

     */

    await prisma.pWResetToken.deleteMany({

      where: { userId: user.id, usedAt: null }

    });

    await prisma.pWResetToken.create({

      data: {

        userId: user.id,

        tokenHash: resetTokenHash,

        expiresAt: resetExpiresAt

      }

    });

    /*

     * The FORGOT_PASSWORD verification token

     * has served its purpose and cannot be reused.

     *

     * Delete this exact token rather than every

     * verification token belonging to the user.

     */

    await prisma.emailVerificationToken.delete({
      where: { id: forgottenPasswordToken.id }
    });

    return res.status(200).json({

      ok: true,
      verified: true,
      resetToken,
      resetTokenExpiresAt: resetExpiresAt.toISOString(),
      message: "Email verified. You may now create a new password."
    });

  } catch (err) {

      console.error("VERIFY FORGOT PASSWORD ERROR:", err);
      return res.status(500).json({
      error: "Unable to verify password recovery."
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