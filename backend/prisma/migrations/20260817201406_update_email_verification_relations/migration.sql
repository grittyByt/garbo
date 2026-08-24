/*
  Warnings:

  - You are about to drop the column `attempts` on the `UserPendingSignup` table. All the data in the column will be lost.
  - You are about to drop the column `codeHash` on the `UserPendingSignup` table. All the data in the column will be lost.
  - You are about to drop the column `expiresAt` on the `UserPendingSignup` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[pendingSignupId]` on the table `EmailVerificationToken` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "EmailVerificationToken_userId_key";

-- DropIndex
DROP INDEX "UserPendingSignup_eMail_key";

-- DropIndex
DROP INDEX "UserPendingSignup_userName_key";

-- AlterTable
ALTER TABLE "EmailVerificationToken" ADD COLUMN     "pendingSignupId" INTEGER,
ALTER COLUMN "userId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "UserPendingSignup" DROP COLUMN "attempts",
DROP COLUMN "codeHash",
DROP COLUMN "expiresAt";

-- CreateIndex
CREATE UNIQUE INDEX "EmailVerificationToken_pendingSignupId_key" ON "EmailVerificationToken"("pendingSignupId");

-- CreateIndex
CREATE INDEX "EmailVerificationToken_userId_idx" ON "EmailVerificationToken"("userId");

-- CreateIndex
CREATE INDEX "EmailVerificationToken_pendingSignupId_idx" ON "EmailVerificationToken"("pendingSignupId");

-- AddForeignKey
ALTER TABLE "EmailVerificationToken" ADD CONSTRAINT "EmailVerificationToken_pendingSignupId_fkey" FOREIGN KEY ("pendingSignupId") REFERENCES "UserPendingSignup"("id") ON DELETE CASCADE ON UPDATE CASCADE;
