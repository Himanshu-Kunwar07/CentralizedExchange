/*
  Warnings:

  - You are about to drop the column `market` on the `Orders` table. All the data in the column will be lost.
  - The `side` column on the `Orders` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "Type" AS ENUM ('MARKET', 'LIMIT');

-- CreateEnum
CREATE TYPE "Side" AS ENUM ('BUY', 'SELL');

-- AlterTable
ALTER TABLE "Orders" DROP COLUMN "market",
ADD COLUMN     "type" "Type" NOT NULL DEFAULT 'LIMIT',
DROP COLUMN "side",
ADD COLUMN     "side" "Side" NOT NULL DEFAULT 'BUY';
