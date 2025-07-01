/*
  Warnings:

  - You are about to drop the column `adminId` on the `animais` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "animais" DROP CONSTRAINT "animais_adminId_fkey";

-- AlterTable
ALTER TABLE "animais" DROP COLUMN "adminId",
ADD COLUMN     "userId" INTEGER NOT NULL DEFAULT 1;

-- AddForeignKey
ALTER TABLE "animais" ADD CONSTRAINT "animais_userId_fkey" FOREIGN KEY ("userId") REFERENCES "admins"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
