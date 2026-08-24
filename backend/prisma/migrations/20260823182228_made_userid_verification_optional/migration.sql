-- DropIndex
DROP INDEX "EmailVerificationToken_userId_key";

-- AlterTable
ALTER TABLE "EmailVerificationToken" ALTER COLUMN "userId" DROP NOT NULL;
