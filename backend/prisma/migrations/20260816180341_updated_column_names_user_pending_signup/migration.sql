/*
  Warnings:

  - You are about to drop the column `email` on the `UserPendingSignup` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[eMail]` on the table `UserPendingSignup` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `eMail` to the `UserPendingSignup` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "UserPendingSignup_email_key";

-- AlterTable
ALTER TABLE "UserPendingSignup" DROP COLUMN "email",
ADD COLUMN     "eMail" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "UserPendingSignup_eMail_key" ON "UserPendingSignup"("eMail");
