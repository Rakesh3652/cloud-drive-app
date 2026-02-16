/*
  Warnings:

  - A unique constraint covering the columns `[resourceType,resourceId,granteeId]` on the table `Share` will be added. If there are existing duplicate values, this will fail.
  - Changed the type of `resourceType` on the `Share` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `role` on the `Share` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "ResourceType" AS ENUM ('FILE', 'FOLDER');

-- CreateEnum
CREATE TYPE "ShareRole" AS ENUM ('VIEWER', 'EDITOR');

-- DropForeignKey
ALTER TABLE "Share" DROP CONSTRAINT "Share_granteeId_fkey";

-- AlterTable
ALTER TABLE "Share" DROP COLUMN "resourceType",
ADD COLUMN     "resourceType" "ResourceType" NOT NULL,
DROP COLUMN "role",
ADD COLUMN     "role" "ShareRole" NOT NULL;

-- CreateTable
CREATE TABLE "LinkShare" (
    "id" TEXT NOT NULL,
    "resourceType" "ResourceType" NOT NULL,
    "resourceId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3),
    "password" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdById" TEXT NOT NULL,

    CONSTRAINT "LinkShare_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "LinkShare_token_key" ON "LinkShare"("token");

-- CreateIndex
CREATE INDEX "LinkShare_resourceType_resourceId_idx" ON "LinkShare"("resourceType", "resourceId");

-- CreateIndex
CREATE INDEX "Share_resourceType_resourceId_idx" ON "Share"("resourceType", "resourceId");

-- CreateIndex
CREATE UNIQUE INDEX "Share_resourceType_resourceId_granteeId_key" ON "Share"("resourceType", "resourceId", "granteeId");

-- AddForeignKey
ALTER TABLE "Share" ADD CONSTRAINT "Share_granteeId_fkey" FOREIGN KEY ("granteeId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LinkShare" ADD CONSTRAINT "LinkShare_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
