/*this function creates a secret token for the user and
* a hashed version for the database so even a DB breach can’t reset accounts.
* */

import crypto from "crypto";

export function makeResetToken() {
  // 32 bytes = 256 bits of entropy
  const token = crypto.randomBytes(32).toString("base64url");
  const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
  return { token, tokenHash };
}