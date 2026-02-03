/*
* Account-based lockout/backoff (DB-enforced)

This protects you even if attackers rotate IPs.

Policy (simple + effective)
	•	each failed login increments failedLoginCount
	•	if failures reach threshold, set lockedUntil = now + X minutes
	•	reset counters on success
* */

import { prisma } from "./prisma";
import crypto from "crypto";
import { makeResetToken } from "./resetTokens";
import { hashPassword } from "./password";


const MAX_FAILS = 5;
const LOCK_MINUTES = 10;
const RESET_MINUTES = 30;

export async function recordFailedLogin(userId: string) {
  const now = new Date();
  const theUser = await prisma.user.update({
    where: { id: userId },
    data: {
      failedLoginCount: { increment: 1 },
      lastFailedLoginAt: now,
    },
    select: { failedLoginCount: true },
  });

  if (theUser.failedLoginCount >= MAX_FAILS) {
    const lockedUntil = new Date(now.getTime() + LOCK_MINUTES * 60 * 1000);
    await prisma.user.update({
      where: { id: userId },
      data: { lockedUntil },
    });
  }
}

export async function clearFailedLogins(userId: string) {
  await prisma.user.update({
    where: { id: userId },
    data: { failedLoginCount: 0, lastFailedLoginAt: null, lockedUntil: null },
  });
}

export function isLocked(lockedUntil: Date | null) {
  return lockedUntil != null && lockedUntil.getTime() > Date.now();
}

export async function createPasswordReset(userId: string) {
  const { token, tokenHash } = makeResetToken();
  const expiresAt = new Date(Date.now() + RESET_MINUTES * 60 * 1000);

  await prisma.PWResetToken.create({
    data: { userId, tokenHash, expiresAt },
  });

  // send token by email (link contains token, NOT tokenHash)
  return token;
}

// Verify token (single-use + not expired) and update password
export async function resetPasswordWithToken(token: string, newPassword: string) {
  const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

  const record = await prisma.PWResetToken.findUnique({
    where: { tokenHash },
    include: { user: true },
  });

  if (!record) return { ok: false, error: "Invalid token." as const };
  if (record.usedAt) return { ok: false, error: "Token already used." as const };
  if (record.expiresAt.getTime() < Date.now()) return { ok: false, error: "Token expired." as const };

  const newHash = await hashPassword(newPassword);

  // Transaction: mark token used + update password
  await prisma.$transaction([
    prisma.PWResetToken.update({
      where: { id: record.id },
      data: { usedAt: new Date() },
    }),
    prisma.user.update({
      where: { id: record.userId },
      data: {
        passwordHash: newHash,
        passwordUpdatedAt: new Date(),
        failedLoginCount: 0,
        lastFailedLoginAt: null,
        lockedUntil: null,
      },
    }),
  ]);

  return { ok: true } as const;
}
