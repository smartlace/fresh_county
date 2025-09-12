-- Update page_type column to allow longer values
-- This fixes the "Data truncated" error when using 'cancellation_policy'

ALTER TABLE website_pages 
MODIFY COLUMN page_type VARCHAR(50) NOT NULL DEFAULT 'custom';

-- Optional: Update any existing data if needed
-- UPDATE website_pages SET page_type = 'cancellation_policy' WHERE page_type = 'return_policy';

-- Verify the change
DESCRIBE website_pages;