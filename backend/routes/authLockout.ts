/*
* Account-based lockout/backoff (DB-enforced)

This protects you even if attackers rotate IPs.

Policy (simple + effective)
	•	each failed login increments failedLoginCount
	•	if failures reach threshold, set lockedUntil = now + X minutes
	•	reset counters on success
* */

import { prisma } from "../lib/prisma";

const MAX_FAILS = 5;
const LOCK_MINUTES = 10;

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