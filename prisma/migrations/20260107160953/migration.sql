/*
  Warnings:

  - You are about to drop the column `shippingMethod` on the `Order` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[cartId,productId,variantId,is_saved_for_later]` on the table `CartItem` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[userId,promoCodeId]` on the table `UserPromoCode` will be added. If there are existing duplicate values, this will fail.
  - Changed the type of `status` on the `OrderTimeline` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Made the column `maxUsesPerUser` on table `PromoCode` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "OrderItem" DROP CONSTRAINT "OrderItem_productId_fkey";

-- DropForeignKey
ALTER TABLE "ProductVariant" DROP CONSTRAINT "ProductVariant_productId_fkey";

-- DropIndex
DROP INDEX "BookmarkedProduct_userId_idx";

-- DropIndex
DROP INDEX "Cart_sessionId_key";

-- DropIndex
DROP INDEX "Cart_userId_key";

-- DropIndex
DROP INDEX "CartItem_cartId_productId_key";

-- DropIndex
DROP INDEX "Comment_productId_idx";

-- DropIndex
DROP INDEX "Order_orderNumber_idx";

-- DropIndex
DROP INDEX "Review_productId_idx";

-- DropIndex
DROP INDEX "UserPromoCode_userId_idx";

-- DropIndex
DROP INDEX "UserPromoCode_userId_promoCodeId_orderId_key";

-- AlterTable
ALTER TABLE "Cart" ADD COLUMN     "notes" TEXT,
ADD COLUMN     "promo_code_id" TEXT,
ADD COLUMN     "selected_shipping_id" TEXT,
ALTER COLUMN "status" SET DEFAULT 'ACTIVE';

-- AlterTable
ALTER TABLE "CartItem" ADD COLUMN     "gift_message" TEXT,
ADD COLUMN     "is_gift_wrapped" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "is_saved_for_later" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "original_price" DECIMAL(10,2),
ADD COLUMN     "product_snapshot" JSONB NOT NULL DEFAULT '{}';

-- AlterTable
ALTER TABLE "Order" DROP COLUMN "shippingMethod",
ADD COLUMN     "shippingMethodId" TEXT,
ADD COLUMN     "shippingSnapshot" JSONB;

-- AlterTable
ALTER TABLE "OrderItem" ALTER COLUMN "productId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "OrderTimeline" DROP COLUMN "status",
ADD COLUMN     "status" "ORDER_STATUS" NOT NULL;

-- AlterTable
ALTER TABLE "PromoCode" ADD COLUMN     "is_first_order_only" BOOLEAN NOT NULL DEFAULT false,
ALTER COLUMN "maxUsesPerUser" SET NOT NULL;

-- CreateIndex
CREATE INDEX "Cart_userId_idx" ON "Cart"("userId");

-- CreateIndex
CREATE INDEX "Cart_status_idx" ON "Cart"("status");

-- CreateIndex
CREATE INDEX "CartItem_productId_idx" ON "CartItem"("productId");

-- CreateIndex
CREATE INDEX "CartItem_is_saved_for_later_idx" ON "CartItem"("is_saved_for_later");

-- CreateIndex
CREATE UNIQUE INDEX "CartItem_cartId_productId_variantId_is_saved_for_later_key" ON "CartItem"("cartId", "productId", "variantId", "is_saved_for_later");

-- CreateIndex
CREATE UNIQUE INDEX "UserPromoCode_userId_promoCodeId_key" ON "UserPromoCode"("userId", "promoCodeId");

-- AddForeignKey
ALTER TABLE "ProductVariant" ADD CONSTRAINT "ProductVariant_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Cart" ADD CONSTRAINT "Cart_promo_code_id_fkey" FOREIGN KEY ("promo_code_id") REFERENCES "PromoCode"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_shippingMethodId_fkey" FOREIGN KEY ("shippingMethodId") REFERENCES "ShippingMethod"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE SET NULL ON UPDATE CASCADE;
