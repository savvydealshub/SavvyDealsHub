-- CreateEnum
CREATE TYPE "AffiliateNetwork" AS ENUM ('amazon', 'skimlinks', 'ebay_partner', 'direct');

-- AlterTable
ALTER TABLE "ClickEvent" ADD COLUMN     "affiliateNetwork" "AffiliateNetwork",
ADD COLUMN     "country" TEXT;

-- AlterTable
ALTER TABLE "Offer" ADD COLUMN     "affiliateNetwork" "AffiliateNetwork" NOT NULL DEFAULT 'direct',
ADD COLUMN     "country" TEXT NOT NULL DEFAULT 'UK',
ADD COLUMN     "deepLink" TEXT;
