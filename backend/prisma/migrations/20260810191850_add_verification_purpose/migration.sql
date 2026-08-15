/*
  Warnings:

  - Added the required column `purpose` to the `EmailVerificationToken` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "EmailVerificationPurpose" AS ENUM ('SIGNUP', 'FORGOT_USERNAME', 'FORGOT_PASSWORD');

-- AlterTable
ALTER TABLE "EmailVerificationToken" ADD COLUMN     "purpose" "EmailVerificationPurpose" NOT NULL;
