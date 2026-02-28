-- CreateEnum
CREATE TYPE "MediaType" AS ENUM ('IMAGE', 'VIDEO');

-- AlterTable
ALTER TABLE "Photo" ADD COLUMN     "durationSec" INTEGER,
ADD COLUMN     "mediaType" "MediaType" NOT NULL DEFAULT 'IMAGE',
ADD COLUMN     "mimeType" TEXT,
ADD COLUMN     "playbackKey" TEXT,
ADD COLUMN     "posterKey" TEXT;

-- CreateIndex
CREATE INDEX "Photo_eventId_mediaType_createdAt_idx" ON "Photo"("eventId", "mediaType", "createdAt");
