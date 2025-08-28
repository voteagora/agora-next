-- Add uuid column to alltenant.proposals for ProposalDraft model
-- Safe to run multiple times (IF NOT EXISTS guards)

-- Try to enable pgcrypto for gen_random_uuid(); ignore if not permitted
DO $$
BEGIN
  BEGIN
    CREATE EXTENSION IF NOT EXISTS pgcrypto;
  EXCEPTION WHEN insufficient_privilege THEN
    NULL; -- ignore if we cannot create extension
  END;
END $$;

ALTER TABLE alltenant.proposals
  ADD COLUMN IF NOT EXISTS uuid uuid;

-- Populate missing uuids
UPDATE alltenant.proposals
SET uuid = gen_random_uuid()
WHERE uuid IS NULL;

-- Add uniqueness
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes
    WHERE schemaname = 'alltenant'
      AND indexname = 'proposals_uuid_key'
  ) THEN
    CREATE UNIQUE INDEX proposals_uuid_key ON alltenant.proposals(uuid);
  END IF;
END $$;

-- Set default for future inserts
ALTER TABLE alltenant.proposals
  ALTER COLUMN uuid SET DEFAULT gen_random_uuid();


