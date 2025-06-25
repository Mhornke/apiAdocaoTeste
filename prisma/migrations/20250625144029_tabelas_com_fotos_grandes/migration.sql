/*
  Warnings:

  - You are about to alter the column `foto` on the `animais` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(2048)`.

*/
-- AlterTable
ALTER TABLE "animais" ALTER COLUMN "foto" SET DATA TYPE VARCHAR(2048);
