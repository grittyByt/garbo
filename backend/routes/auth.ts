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
// routes/auth.ts
import { Router } from "express";
import * as argon2 from "argon2";
import { prisma } from "../lib/prisma";
import { hashPassword, verifyPassword } from "../lib/password";
import {loginIpLimiter} from "./middleware";

const router = Router();

router.post("/signup", async (req, res) => {
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

    // Create user
    const welcomeUser = await prisma.user.create({
      data: {
        firstName: fName,
        lastName: lName,
        userName: uName,
        eMail: eMail,
        passwordHash: passwordHash,
      },
      select: { id: true, firstName: true, lastName: true, userName: true, eMail: true, createdAt: true },
    });

    // 201 = Created
    /*
    * successful response status code indicates that the HTTP request has led to
    * the creation of a resource.
    */
    return res.status(201).json({ welcomeUser });
  } catch (err) {
    console.error(err);
    // 500 = Internal Server Issue
    /*
    * server error response status code indicates that the server encountered an
    * unexpected condition that prevented it from fulfilling the request.
    * */
    return res.status(500).json({ error: "Server error" });
  }
});

router.post("/login", loginIpLimiter, async (req, res) => {
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

/**
 * POST /api/auth/logout
 * If you use cookies/sessions, clear them here.
 */
router.post("/logout", async (_req, res) => {
  // Placeholder until sessions are added
  return res.status(200).json({ ok: true });
});

/**
 * GET /api/auth/me
 * Returns current user if logged in (requires sessions/tokens to be meaningful)
 */
router.get("/me", async (_req, res) => {
  // Placeholder until sessions are added
  return res.status(200).json({ user: null });
});

export default router;