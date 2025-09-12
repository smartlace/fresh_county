-- Product Variations System Schema
-- This creates tables to support product variations (size, color, etc.) with different prices

-- 1. Table to define variation types (Size, Color, Material, etc.)
CREATE TABLE IF NOT EXISTS product_variation_types (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL UNIQUE,
  slug VARCHAR(100) NOT NULL UNIQUE,
  display_name VARCHAR(100) NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 2. Table to define variation options for each type
CREATE TABLE IF NOT EXISTS product_variation_options (
  id INT PRIMARY KEY AUTO_INCREMENT,
  variation_type_id INT NOT NULL,
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(100) NOT NULL,
  display_name VARCHAR(100) NOT NULL,
  color_hex VARCHAR(7) DEFAULT NULL, -- For color variations
  sort_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (variation_type_id) REFERENCES product_variation_types(id) ON DELETE CASCADE,
  UNIQUE KEY unique_option_per_type (variation_type_id, slug)
);

-- 3. Table to link products with their variation combinations
CREATE TABLE IF NOT EXISTS product_variations (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  product_id VARCHAR(36) NOT NULL,
  sku VARCHAR(100) UNIQUE NOT NULL,
  price DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  sale_price DECIMAL(10, 2) DEFAULT NULL,
  stock_quantity INT NOT NULL DEFAULT 0,
  stock_status ENUM('in_stock', 'out_of_stock', 'low_stock') DEFAULT 'in_stock',
  weight DECIMAL(8, 2) DEFAULT NULL,
  dimensions JSON DEFAULT NULL, -- {length: x, width: y, height: z}
  images JSON DEFAULT NULL, -- Array of image URLs specific to this variation
  is_active BOOLEAN DEFAULT TRUE,
  is_default BOOLEAN DEFAULT FALSE, -- Mark one variation as default
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  INDEX idx_product_variations_product (product_id),
  INDEX idx_product_variations_sku (sku)
);

-- 4. Junction table to map variation combinations (e.g., Size: Large + Color: Red)
CREATE TABLE IF NOT EXISTS product_variation_combinations (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  product_variation_id VARCHAR(36) NOT NULL,
  variation_option_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (product_variation_id) REFERENCES product_variations(id) ON DELETE CASCADE,
  FOREIGN KEY (variation_option_id) REFERENCES product_variation_options(id) ON DELETE CASCADE,
  UNIQUE KEY unique_combination (product_variation_id, variation_option_id)
);

-- Insert default variation types
INSERT IGNORE INTO product_variation_types (name, slug, display_name, description, sort_order) VALUES
('size', 'size', 'Size', 'Product size variations', 1),
('color', 'color', 'Color', 'Product color variations', 2),
('material', 'material', 'Material', 'Product material variations', 3),
('style', 'style', 'Style', 'Product style variations', 4);

-- Insert default size options
INSERT IGNORE INTO product_variation_options (variation_type_id, name, slug, display_name, sort_order) VALUES
((SELECT id FROM product_variation_types WHERE slug = 'size'), 'xs', 'xs', 'Extra Small', 1),
((SELECT id FROM product_variation_types WHERE slug = 'size'), 'small', 'small', 'Small', 2),
((SELECT id FROM product_variation_types WHERE slug = 'size'), 'medium', 'medium', 'Medium', 3),
((SELECT id FROM product_variation_types WHERE slug = 'size'), 'large', 'large', 'Large', 4),
((SELECT id FROM product_variation_types WHERE slug = 'size'), 'xl', 'xl', 'Extra Large', 5),
((SELECT id FROM product_variation_types WHERE slug = 'size'), 'xxl', 'xxl', 'Extra Extra Large', 6);

-- Insert default color options
INSERT IGNORE INTO product_variation_options (variation_type_id, name, slug, display_name, color_hex, sort_order) VALUES
((SELECT id FROM product_variation_types WHERE slug = 'color'), 'red', 'red', 'Red', '#FF0000', 1),
((SELECT id FROM product_variation_types WHERE slug = 'color'), 'blue', 'blue', 'Blue', '#0000FF', 2),
((SELECT id FROM product_variation_types WHERE slug = 'color'), 'green', 'green', 'Green', '#008000', 3),
((SELECT id FROM product_variation_types WHERE slug = 'color'), 'black', 'black', 'Black', '#000000', 4),
((SELECT id FROM product_variation_types WHERE slug = 'color'), 'white', 'white', 'White', '#FFFFFF', 5),
((SELECT id FROM product_variation_types WHERE slug = 'color'), 'yellow', 'yellow', 'Yellow', '#FFFF00', 6);