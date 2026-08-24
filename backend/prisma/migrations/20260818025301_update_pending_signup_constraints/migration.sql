/*
  Warnings:

  - A unique constraint covering the columns `[userName]` on the table `UserPendingSignup` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[eMail]` on the table `UserPendingSignup` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "UserPendingSignup_userName_key" ON "UserPendingSignup"("userName");

-- CreateIndex
CREATE UNIQUE INDEX "UserPendingSignup_eMail_key" ON "UserPendingSignup"("eMail");
