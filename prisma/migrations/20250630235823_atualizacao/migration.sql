/*
  Warnings:

  - You are about to drop the `admins` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "animais" DROP CONSTRAINT "animais_userId_fkey";

-- AlterTable
ALTER TABLE "animais" ALTER COLUMN "userId" DROP DEFAULT,
ALTER COLUMN "userId" SET DATA TYPE TEXT;

-- DropTable
DROP TABLE "admins";

-- AddForeignKey
ALTER TABLE "animais" ADD CONSTRAINT "animais_userId_fkey" FOREIGN KEY ("userId") REFERENCES "adotantes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
