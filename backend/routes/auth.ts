// routes/auth.ts
import { Router } from "express";
import * as argon2 from "argon2";
import { prisma } from "../lib/prisma";
import { hashPassword, verifyPassword } from "../lib/password";

const router = Router();

router.post("/signup", async (req, res) => {
  try {
    const { fName, lName, uName, eMail, password } = req.body ?? {};

    // Server-side validation (never trust browser)
    if (!fName || fName.length < 3 || fName.length > 25) {
      return res.status(400).json({
        error: "Invalid first name"
      });
    }
    if (!lName || lName.length < 3 || lName.length > 25) {
      return res.status(400).json({
        error: "Invalid last name"
      });
    }

    // const userExist = prisma.user.findUnique({ where: { uName } });
    // if (userExist) {
    //   return res.status(400).json({
    //     error: "Username already exist"
    //   });
    // }

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
    const existing = await prisma.user.findFirst({
      where: { OR: [{ eMail: eMail }, { userName: uName }] },
      select: { id: true },
    });

    if (existing) {
      return res.status(409).json({
        error: "Email or username already in use"
      });
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Create user
    const user = await prisma.user.create({
      data: {
        firstName: fName,
        lastName: lName,
        userName: uName,
        eMail: eMail,
        passwordHash,
      },
      select: { firstName: true, lastName: true, userName: true, eMail: true, createdAt: true },
    });

    return res.status(201).json({ user });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server error" });
  }
});

router.post("/login", async (req, res) => {
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