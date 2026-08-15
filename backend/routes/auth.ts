//Authentication routes that take form input and store users

/*
* How this schema is used for Signup (backend flow)

Goal

Create a row in User with email/username/... and passwordHash.

Typical backend steps
	1.	Receive signup data: firstName, lastName, email, username, password
	2.	Validate it (lengths, email format, password rules)
	3.	Check uniqueness:
	•	findUnique({ where: { email } })
	•	findUnique({ where: { username } })
	4.	Hash password with argon2id
	5.	Create user:
	•	prisma.user.create({ data: {...} })
	6.	Return success (and start a session)

Key point: the frontend should not “verify” by checking the DB. It verifies by:
	•	checking basic form rules locally (fast feedback),
	•	then calling /api/signup,
	•	backend returns success or validation errors.
* */
/*
* How this schema is used for Login (backend flow)

Goal

Find the user by email or username, then verify password.

Typical backend steps
	1.	Receive login data: identifier (email or username), password
	2.	Find user:
	•	if identifier looks like email -> where: { email }
	•	else -> where: { username }
	3.	If no user: return “invalid credentials” (generic message)
	4.	Verify:
	•	argon2.verify(user.passwordHash, passwordAttempt)
	5.	If ok: create session/token and return success

Again: frontend does not read passwordHash or user data directly from DB.

* */

import { Router } from "express";
import type { Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { verifyPassword } from "../lib/password";
import {loginIpLimiter} from "./middleware";
import {
      signupHandler,
      verifyEmailHandler,
      resendVerificationHandler,
      forgotUsernameHandler,
      verifyForgotUsernameHandler,
      forgotPasswordHandler,
      verifyForgotPasswordHandler,
      resetPasswordHandler
} from "../controllers/auth.controller";



const authRouter = Router();

// SIGNUP
authRouter.post("/signup", signupHandler);

// LOGIN
authRouter.post("/login", loginIpLimiter, async (req: Request, res: Response) => {
  try {

    const {loginUser, loginPass} = req.body;

    if (!loginUser || !loginPass) {
      return res.status(400).json({
        error: "Missing username or password"
      });
    }

    const isEmailLegit = loginUser.includes("@");

    const user = await prisma.user.findUnique({ where: { eMail: isEmailLegit}});

    // Generic error so attackers can't tell if the user exists
    if (!user) {
      return res.status(401).json({ error: "Invalid credentials." });
    }

    const ok = await verifyPassword(user.passwordHash, loginPass);
    if (!ok) {
      return res.status(401).json({ error: "Invalid credentials." });
    }

    // Start session or return token (placeholder)
    return res.status(200).json({
      user: {
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.eMail,
        userName: user.userName
      }
    });
  } catch (err) {
    return res.status(500).json({ error: "Server error during login." });
  }
});

// VERIFY SIGNUP EMAIL
authRouter.post("/verify-email", verifyEmailHandler);

authRouter.post("/resend-verification", resendVerificationHandler);

// FORGOT USERNAME
authRouter.post("/forgot-username", forgotUsernameHandler);

authRouter.post("/forgot-username/verify", verifyForgotUsernameHandler);


// FORGOT PASSWORD
authRouter.post("/forgot-password", forgotPasswordHandler);

authRouter.post("/forgot-password/verify", verifyForgotPasswordHandler);

// RESET PASSWORD
authRouter.post("/reset-password", resetPasswordHandler);


/**
 * POST /api/auth/logout
 * If you use cookies/sessions, clear them here.
 */
authRouter.post("/logout", async (_req, res) => {
  // Placeholder until sessions are added
  return res.status(200).json({ ok: true });
});



/**
 * GET /api/auth/me
 * Returns current user if logged in (requires sessions/tokens to be meaningful)
 */
authRouter.get("/me", async (_req, res) => {
  // Placeholder until sessions are added
  return res.status(200).json({ user: null });
});

export default authRouter;