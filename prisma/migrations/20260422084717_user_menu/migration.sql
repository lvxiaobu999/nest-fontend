/*
  Warnings:

  - This migration changes several integer flag columns to boolean while preserving existing 0/1 values.

*/
BEGIN;

-- AlterTable
ALTER TABLE "menus"
  ALTER COLUMN "enabled" DROP DEFAULT,
  ALTER COLUMN "enabled" TYPE BOOLEAN
  USING CASE
    WHEN "enabled" = 1 THEN TRUE
    WHEN "enabled" = 0 THEN FALSE
    ELSE NULL
  END,
  ALTER COLUMN "enabled" SET DEFAULT TRUE;

-- AlterTable
ALTER TABLE "roles"
  ALTER COLUMN "enabled" DROP DEFAULT,
  ALTER COLUMN "enabled" TYPE BOOLEAN
  USING CASE
    WHEN "enabled" = 1 THEN TRUE
    WHEN "enabled" = 0 THEN FALSE
    ELSE NULL
  END,
  ALTER COLUMN "enabled" SET DEFAULT TRUE;

-- AlterTable
ALTER TABLE "users"
  ALTER COLUMN "isSuperAdmin" DROP DEFAULT,
  ALTER COLUMN "isSuperAdmin" TYPE BOOLEAN
  USING CASE
    WHEN "isSuperAdmin" = 1 THEN TRUE
    WHEN "isSuperAdmin" = 0 THEN FALSE
    ELSE NULL
  END,
  ALTER COLUMN "isSuperAdmin" SET DEFAULT TRUE;

-- AlterTable
ALTER TABLE "users"
  ALTER COLUMN "enabled" DROP DEFAULT,
  ALTER COLUMN "enabled" TYPE BOOLEAN
  USING CASE
    WHEN "enabled" = 1 THEN TRUE
    WHEN "enabled" = 0 THEN FALSE
    ELSE NULL
  END,
  ALTER COLUMN "enabled" SET DEFAULT TRUE;

COMMIT;

-- AlterTable
ALTER TABLE "permissions"
  ALTER COLUMN "enabled" DROP DEFAULT,
  ALTER COLUMN "enabled" TYPE BOOLEAN
  USING CASE
    WHEN "enabled" = 1 THEN TRUE
    WHEN "enabled" = 0 THEN FALSE
    ELSE NULL
  END,
  ALTER COLUMN "enabled" SET DEFAULT TRUE;

-- AlterTable
ALTER TABLE "dashboard_domains"
  ALTER COLUMN "enabled" DROP DEFAULT,
  ALTER COLUMN "enabled" TYPE BOOLEAN
  USING CASE
    WHEN "enabled" = 1 THEN TRUE
    WHEN "enabled" = 0 THEN FALSE
    ELSE NULL
  END,
  ALTER COLUMN "enabled" SET DEFAULT TRUE;
