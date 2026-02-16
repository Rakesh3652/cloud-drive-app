-- CreateTable
CREATE TABLE "Share" (
    "id" TEXT NOT NULL,
    "resourceType" TEXT NOT NULL,
    "resourceId" TEXT NOT NULL,
    "granteeId" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Share_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Share_resourceType_resourceId_idx" ON "Share"("resourceType", "resourceId");

-- AddForeignKey
ALTER TABLE "Share" ADD CONSTRAINT "Share_granteeId_fkey" FOREIGN KEY ("granteeId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
