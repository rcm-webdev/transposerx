-- Remove existing duplicate rows, keeping only the most recent per (userId, eye)
DELETE FROM "TranspositionHistory"
WHERE id NOT IN (
  SELECT DISTINCT ON ("userId", eye) id
  FROM "TranspositionHistory"
  ORDER BY "userId", eye, "createdAt" DESC, id DESC
);

-- Drop old index
DROP INDEX IF EXISTS "TranspositionHistory_userId_idx";

-- Add unique constraint
ALTER TABLE "TranspositionHistory" ADD CONSTRAINT "TranspositionHistory_userId_eye_key" UNIQUE ("userId", eye);
