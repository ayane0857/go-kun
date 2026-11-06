/*
  Warnings:

  - The `meanings` column on the `Word` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "Word" DROP COLUMN "meanings",
ADD COLUMN     "meanings" TEXT[];
