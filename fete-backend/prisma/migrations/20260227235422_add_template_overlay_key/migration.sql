-- AlterTable
ALTER TABLE "Template" ADD COLUMN     "overlayKey" TEXT;

-- CreateIndex
CREATE INDEX "Template_createdAt_idx" ON "Template"("createdAt");
