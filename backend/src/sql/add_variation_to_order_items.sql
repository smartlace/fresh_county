-- Add variation support to order_items table
ALTER TABLE order_items ADD COLUMN variation_id VARCHAR(36) NULL;
ALTER TABLE order_items ADD COLUMN variation_name VARCHAR(255) NULL;

-- Add foreign key constraint for variation_id
-- Note: This is optional since variations might be deleted
-- ALTER TABLE order_items ADD FOREIGN KEY (variation_id) REFERENCES product_variations(id) ON DELETE SET NULL;

-- Add index for better performance
ALTER TABLE order_items ADD INDEX idx_order_items_variation_id (variation_id);