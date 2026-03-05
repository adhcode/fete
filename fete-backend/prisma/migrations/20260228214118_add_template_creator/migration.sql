-- AlterTable
ALTER TABLE "Template" ADD COLUMN     "createdByOrganizerId" TEXT;

-- CreateIndex
CREATE INDEX "Template_createdByOrganizerId_idx" ON "Template"("createdByOrganizerId");

-- AddForeignKey
ALTER TABLE "Template" ADD CONSTRAINT "Template_createdByOrganizerId_fkey" FOREIGN KEY ("createdByOrganizerId") REFERENCES "Organizer"("id") ON DELETE SET NULL ON UPDATE CASCADE;
