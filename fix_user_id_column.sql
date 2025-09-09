-- Make user_id column nullable to support both authenticated and non-authenticated usage
ALTER TABLE appliances ALTER COLUMN user_id DROP NOT NULL;