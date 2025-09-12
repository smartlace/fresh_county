-- Add delivery fields to orders table
ALTER TABLE orders ADD COLUMN delivery_type VARCHAR(20) DEFAULT 'home' AFTER shipping_address;
ALTER TABLE orders ADD COLUMN delivery_cost DECIMAL(10,2) DEFAULT 0.00 AFTER delivery_type;

-- Add indexes for better query performance
ALTER TABLE orders ADD INDEX idx_orders_delivery_type (delivery_type);