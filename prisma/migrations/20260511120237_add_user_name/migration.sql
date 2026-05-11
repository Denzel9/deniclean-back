-- AlterTable
ALTER TABLE "users" ADD COLUMN "name" VARCHAR(120);

-- Backfill existing rows
UPDATE "users"
SET "name" = "phone"
WHERE "name" IS NULL;

-- Enforce NOT NULL after backfill
ALTER TABLE "users"
ALTER COLUMN "name" SET NOT NULL;
