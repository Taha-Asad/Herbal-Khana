/*
  Warnings:

  - The values [MERGED,EXPIRED] on the enum `CartStatus` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `promo_code_id` on the `Cart` table. All the data in the column will be lost.
  - You are about to drop the column `addedAt` on the `CartItem` table. All the data in the column will be lost.
  - You are about to drop the column `gift_message` on the `CartItem` table. All the data in the column will be lost.
  - You are about to drop the column `is_gift_wrapped` on the `CartItem` table. All the data in the column will be lost.
  - You are about to drop the column `is_saved_for_later` on the `CartItem` table. All the data in the column will be lost.
  - You are about to drop the column `original_price` on the `CartItem` table. All the data in the column will be lost.
  - You are about to drop the column `price` on the `CartItem` table. All the data in the column will be lost.
  - You are about to drop the column `productId` on the `CartItem` table. All the data in the column will be lost.
  - You are about to drop the column `product_snapshot` on the `CartItem` table. All the data in the column will be lost.
  - You are about to drop the column `compareAtPrice` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `lowStockThreshold` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `price` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `stock` on the `Product` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[cartId,variantId,isSavedForLater]` on the table `CartItem` will be added. If there are existing duplicate values, this will fail.
  - Made the column `variantId` on table `CartItem` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `size` to the `ProductVariant` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "CartStatus_new" AS ENUM ('ACTIVE', 'COMPLETED');
ALTER TABLE "public"."Cart" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "Cart" ALTER COLUMN "status" TYPE "CartStatus_new" USING ("status"::text::"CartStatus_new");
ALTER TYPE "CartStatus" RENAME TO "CartStatus_old";
ALTER TYPE "CartStatus_new" RENAME TO "CartStatus";
DROP TYPE "public"."CartStatus_old";
ALTER TABLE "Cart" ALTER COLUMN "status" SET DEFAULT 'ACTIVE';
COMMIT;

-- DropForeignKey
ALTER TABLE "Cart" DROP CONSTRAINT "Cart_promo_code_id_fkey";

-- DropForeignKey
ALTER TABLE "CartItem" DROP CONSTRAINT "CartItem_productId_fkey";

-- DropForeignKey
ALTER TABLE "CartItem" DROP CONSTRAINT "CartItem_variantId_fkey";

-- DropIndex
DROP INDEX "CartItem_cartId_idx";

-- DropIndex
DROP INDEX "CartItem_cartId_productId_variantId_is_saved_for_later_key";

-- DropIndex
DROP INDEX "CartItem_is_saved_for_later_idx";

-- DropIndex
DROP INDEX "CartItem_productId_idx";

-- AlterTable
ALTER TABLE "Cart" DROP COLUMN "promo_code_id",
ADD COLUMN     "appliedPromoCode" TEXT;

-- AlterTable
ALTER TABLE "CartItem" DROP COLUMN "addedAt",
DROP COLUMN "gift_message",
DROP COLUMN "is_gift_wrapped",
DROP COLUMN "is_saved_for_later",
DROP COLUMN "original_price",
DROP COLUMN "price",
DROP COLUMN "productId",
DROP COLUMN "product_snapshot",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "isSavedForLater" BOOLEAN NOT NULL DEFAULT false,
ALTER COLUMN "variantId" SET NOT NULL;

-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "promoSnapshot" JSONB;

-- AlterTable
ALTER TABLE "Product" DROP COLUMN "compareAtPrice",
DROP COLUMN "lowStockThreshold",
DROP COLUMN "price",
DROP COLUMN "stock";

-- AlterTable
ALTER TABLE "ProductVariant" ADD COLUMN     "concentration" TEXT,
ADD COLUMN     "lowStockThreshold" INTEGER NOT NULL DEFAULT 5,
ADD COLUMN     "scent" TEXT,
ADD COLUMN     "size" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "CartItem_cartId_variantId_isSavedForLater_key" ON "CartItem"("cartId", "variantId", "isSavedForLater");

-- AddForeignKey
ALTER TABLE "CartItem" ADD CONSTRAINT "CartItem_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES "ProductVariant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
