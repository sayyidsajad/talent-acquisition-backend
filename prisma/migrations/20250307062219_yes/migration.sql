-- DropIndex
DROP INDEX "User_credentialId_key";

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "challenge" TEXT;
