import * as argon2 from "argon2";

const PEPPER = process.env.PASSWORD_PEPPER;
if (!PEPPER) throw new Error("PASSWORD_PEPPER missing from environment");

export async function hashPassword(password: string): Promise<string> {
  return argon2.hash(password + PEPPER, {
    type: argon2.argon2id,
    memoryCost: 19456,
    timeCost: 2,
    parallelism: 1,
  });
}

export async function verifyPassword(storedHash: string, attempt: string): Promise<boolean> {
  try {
    return await argon2.verify(storedHash, attempt + PEPPER);
  } catch {
    return false;
  }
}