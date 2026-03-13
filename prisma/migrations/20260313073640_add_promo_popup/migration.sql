-- CreateTable
CREATE TABLE "promo_popups" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "imageUrl" TEXT,
    "promoCode" TEXT,
    "ctaText" TEXT,
    "ctaUrl" TEXT,
    "startDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endDate" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "priority" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "promo_popups_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "promo_popups_isActive_startDate_endDate_idx" ON "promo_popups"("isActive", "startDate", "endDate");
