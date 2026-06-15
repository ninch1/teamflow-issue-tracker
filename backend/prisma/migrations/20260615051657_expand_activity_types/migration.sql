-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "ActivityType" ADD VALUE 'ISSUE_PRIORITY_CHANGED';
ALTER TYPE "ActivityType" ADD VALUE 'ISSUE_ASSIGNEE_CHANGED';
ALTER TYPE "ActivityType" ADD VALUE 'COMMENT_ADDED';
ALTER TYPE "ActivityType" ADD VALUE 'ISSUE_DELETED';
ALTER TYPE "ActivityType" ADD VALUE 'ISSUE_ARCHIVED';
ALTER TYPE "ActivityType" ADD VALUE 'WORKSPACE_MEMBER_ADDED';
ALTER TYPE "ActivityType" ADD VALUE 'WORKSPACE_MEMBER_REMOVED';
