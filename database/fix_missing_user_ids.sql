-- Fix users with missing or empty IDs
-- This script generates new UUIDs for users with empty or NULL IDs

-- First, check how many users have missing IDs
SELECT 
    COUNT(*) as total_users,
    COUNT(CASE WHEN id IS NULL OR id = '' THEN 1 END) as users_with_missing_ids
FROM users;

-- Show users with missing IDs (for verification)
SELECT id, first_name, last_name, email, created_at 
FROM users 
WHERE id IS NULL OR id = '';

-- Fix: Update users with missing IDs to have new UUIDs
UPDATE users 
SET id = UUID() 
WHERE id IS NULL OR id = '';

-- Verify the fix
SELECT 
    COUNT(*) as total_users,
    COUNT(CASE WHEN id IS NULL OR id = '' THEN 1 END) as users_with_missing_ids_after_fix
FROM users;

-- Show the updated users
SELECT id, first_name, last_name, email, created_at 
FROM users 
WHERE first_name = 'Jennifer' AND last_name = 'Onyejekwe';