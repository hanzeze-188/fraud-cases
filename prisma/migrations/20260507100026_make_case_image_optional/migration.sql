-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_CaseImage" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "caseId" INTEGER,
    "url" TEXT NOT NULL,
    "alt" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CaseImage_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "Case" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_CaseImage" ("alt", "caseId", "createdAt", "id", "url") SELECT "alt", "caseId", "createdAt", "id", "url" FROM "CaseImage";
DROP TABLE "CaseImage";
ALTER TABLE "new_CaseImage" RENAME TO "CaseImage";
CREATE INDEX "CaseImage_caseId_idx" ON "CaseImage"("caseId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
