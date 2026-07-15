-- AlterTable
ALTER TABLE "journal_entries" ADD COLUMN     "isPinned" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "settings" ADD COLUMN     "defaultVisibility" "Visibility" NOT NULL DEFAULT 'PUBLIC';

-- CreateIndex
CREATE INDEX "journal_entries_userId_isPinned_idx" ON "journal_entries"("userId", "isPinned");
