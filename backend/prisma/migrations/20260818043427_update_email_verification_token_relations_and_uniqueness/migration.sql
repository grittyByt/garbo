/*
  Warnings:

  - A unique constraint covering the columns `[userId]` on the table `EmailVerificationToken` will be added. If there are existing duplicate values, this will fail.
  - Made the column `userId` on table `EmailVerificationToken` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "EmailVerificationToken" ALTER COLUMN "userId" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "EmailVerificationToken_userId_key" ON "EmailVerificationToken"("userId");
