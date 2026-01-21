/*
  Warnings:

  - You are about to drop the column `email` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `User` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[eMail]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[uName]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `eMail` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `fName` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `lName` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `uName` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "User_email_idx";

-- DropIndex
DROP INDEX "User_email_key";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "email",
DROP COLUMN "name",
ADD COLUMN     "eMail" TEXT NOT NULL,
ADD COLUMN     "fName" TEXT NOT NULL,
ADD COLUMN     "lName" TEXT NOT NULL,
ADD COLUMN     "uName" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "User_eMail_key" ON "User"("eMail");

-- CreateIndex
CREATE UNIQUE INDEX "User_uName_key" ON "User"("uName");

-- CreateIndex
CREATE INDEX "User_eMail_idx" ON "User"("eMail");
