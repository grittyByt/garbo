/*
  Warnings:

  - A unique constraint covering the columns `[userId,purpose]` on the table `EmailVerificationToken` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "EmailVerificationToken_userId_purpose_key" ON "EmailVerificationToken"("userId", "purpose");
