-- =============================================================================
-- SHIPPING ZONES MIGRATION
-- =============================================================================
-- This migration adds shipping zones support to the orders system
-- =============================================================================

-- Add shipping zone fields to orders table if they don't exist
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS shipping_zone_id VARCHAR(36) NULL,
ADD COLUMN IF NOT EXISTS shipping_zone_name VARCHAR(100) NULL,
ADD INDEX IF NOT EXISTS idx_shipping_zone (shipping_zone_id),
ADD INDEX IF NOT EXISTS idx_shipping_zone_name (shipping_zone_name);

-- Create shipping_zones table if it doesn't exist
CREATE TABLE IF NOT EXISTS shipping_zones (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    price DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_name (name),
    INDEX idx_active (is_active),
    INDEX idx_price (price)
);

-- Add foreign key constraint if it doesn't exist
-- Note: This will only work if there are no orphaned records
SET @constraint_exists = (
    SELECT COUNT(*) 
    FROM information_schema.table_constraints 
    WHERE constraint_name = 'fk_orders_shipping_zone' 
    AND table_name = 'orders'
);

SET @sql = IF(@constraint_exists = 0, 
    'ALTER TABLE orders ADD CONSTRAINT fk_orders_shipping_zone FOREIGN KEY (shipping_zone_id) REFERENCES shipping_zones(id) ON DELETE SET NULL',
    'SELECT "Foreign key constraint already exists" as result'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Insert default shipping zones if none exist
INSERT IGNORE INTO shipping_zones (name, description, price, is_active) VALUES
('Lagos Island', 'Lagos Island delivery zone', 1500.00, TRUE),
('Lagos Mainland', 'Lagos Mainland delivery zone', 2000.00, TRUE),
('Victoria Island', 'Victoria Island delivery zone', 1500.00, TRUE),
('Ikoyi', 'Ikoyi delivery zone', 1500.00, TRUE),
('Lekki', 'Lekki delivery zone', 2500.00, TRUE),
('Ikeja', 'Ikeja delivery zone', 2000.00, TRUE),
('Surulere', 'Surulere delivery zone', 2000.00, TRUE),
('Yaba', 'Yaba delivery zone', 1800.00, TRUE),
('Ajah', 'Ajah delivery zone', 3000.00, TRUE),
('Abuja', 'Federal Capital Territory', 4000.00, TRUE),
('Port Harcourt', 'Rivers State delivery', 5000.00, TRUE),
('Kano', 'Kano State delivery', 5500.00, TRUE),
('Ibadan', 'Oyo State delivery', 4500.00, TRUE),
('Benin City', 'Edo State delivery', 5000.00, TRUE),
('Enugu', 'Enugu State delivery', 5500.00, TRUE);

-- Migration completed message
SELECT 'Shipping zones migration completed successfully' as status;