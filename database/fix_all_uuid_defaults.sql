-- Fix UUID defaults for ALL tables in the database
-- This script adds DEFAULT (uuid()) to all id columns that are missing it

-- First, let's check which tables have records with empty IDs
SELECT 'blog_categories' as table_name, COUNT(*) as total, COUNT(CASE WHEN id IS NULL OR id = '' THEN 1 END) as empty_ids FROM blog_categories
UNION ALL
SELECT 'blog_comments' as table_name, COUNT(*) as total, COUNT(CASE WHEN id IS NULL OR id = '' THEN 1 END) as empty_ids FROM blog_comments
UNION ALL
SELECT 'blog_posts' as table_name, COUNT(*) as total, COUNT(CASE WHEN id IS NULL OR id = '' THEN 1 END) as empty_ids FROM blog_posts
UNION ALL
SELECT 'categories' as table_name, COUNT(*) as total, COUNT(CASE WHEN id IS NULL OR id = '' THEN 1 END) as empty_ids FROM categories
UNION ALL
SELECT 'products' as table_name, COUNT(*) as total, COUNT(CASE WHEN id IS NULL OR id = '' THEN 1 END) as empty_ids FROM products
UNION ALL
SELECT 'users' as table_name, COUNT(*) as total, COUNT(CASE WHEN id IS NULL OR id = '' THEN 1 END) as empty_ids FROM users
UNION ALL
SELECT 'orders' as table_name, COUNT(*) as total, COUNT(CASE WHEN id IS NULL OR id = '' THEN 1 END) as empty_ids FROM orders
UNION ALL
SELECT 'order_items' as table_name, COUNT(*) as total, COUNT(CASE WHEN id IS NULL OR id = '' THEN 1 END) as empty_ids FROM order_items;

-- Fix existing records with empty IDs BEFORE adding defaults
UPDATE blog_categories SET id = UUID() WHERE id IS NULL OR id = '';
UPDATE blog_comments SET id = UUID() WHERE id IS NULL OR id = '';
UPDATE blog_posts SET id = UUID() WHERE id IS NULL OR id = '';
UPDATE categories SET id = UUID() WHERE id IS NULL OR id = '';
UPDATE products SET id = UUID() WHERE id IS NULL OR id = '';
UPDATE users SET id = UUID() WHERE id IS NULL OR id = '';
UPDATE orders SET id = UUID() WHERE id IS NULL OR id = '';
UPDATE order_items SET id = UUID() WHERE id IS NULL OR id = '';
UPDATE cart_items SET id = UUID() WHERE id IS NULL OR id = '';
UPDATE coupons SET id = UUID() WHERE id IS NULL OR id = '';
UPDATE coupon_usage SET id = UUID() WHERE id IS NULL OR id = '';
UPDATE reviews SET id = UUID() WHERE id IS NULL OR id = '';
UPDATE newsletter_subscriptions SET id = UUID() WHERE id IS NULL OR id = '';
UPDATE newsletter_campaigns SET id = UUID() WHERE id IS NULL OR id = '';
UPDATE product_variations SET id = UUID() WHERE id IS NULL OR id = '';
UPDATE product_variation_combinations SET id = UUID() WHERE id IS NULL OR id = '';
UPDATE shipping_zones SET id = UUID() WHERE id IS NULL OR id = '';
UPDATE website_pages SET id = UUID() WHERE id IS NULL OR id = '';
UPDATE faq_items SET id = UUID() WHERE id IS NULL OR id = '';
UPDATE system_settings SET id = UUID() WHERE id IS NULL OR id = '';

-- Now add DEFAULT (uuid()) to all tables that need it
-- Note: MySQL syntax may vary, these are the standard commands

ALTER TABLE blog_categories ALTER COLUMN id SET DEFAULT (UUID());
ALTER TABLE blog_comments ALTER COLUMN id SET DEFAULT (UUID());
ALTER TABLE blog_posts ALTER COLUMN id SET DEFAULT (UUID());
ALTER TABLE blog_post_tags ALTER COLUMN id SET DEFAULT (UUID());
ALTER TABLE blog_post_views ALTER COLUMN id SET DEFAULT (UUID());
ALTER TABLE blog_seo_settings ALTER COLUMN id SET DEFAULT (UUID());
ALTER TABLE blog_tags ALTER COLUMN id SET DEFAULT (UUID());
ALTER TABLE cart_items ALTER COLUMN id SET DEFAULT (UUID());
ALTER TABLE categories ALTER COLUMN id SET DEFAULT (UUID());
ALTER TABLE coupon_usage ALTER COLUMN id SET DEFAULT (UUID());
ALTER TABLE coupons ALTER COLUMN id SET DEFAULT (UUID());
ALTER TABLE faq_items ALTER COLUMN id SET DEFAULT (UUID());
ALTER TABLE newsletter_campaign_recipients ALTER COLUMN id SET DEFAULT (UUID());
ALTER TABLE newsletter_campaigns ALTER COLUMN id SET DEFAULT (UUID());
ALTER TABLE newsletter_subscription_history ALTER COLUMN id SET DEFAULT (UUID());
ALTER TABLE newsletter_subscriptions ALTER COLUMN id SET DEFAULT (UUID());
ALTER TABLE newsletter_templates ALTER COLUMN id SET DEFAULT (UUID());
ALTER TABLE order_items ALTER COLUMN id SET DEFAULT (UUID());
ALTER TABLE order_status_history ALTER COLUMN id SET DEFAULT (UUID());
ALTER TABLE orders ALTER COLUMN id SET DEFAULT (UUID());
ALTER TABLE page_versions ALTER COLUMN id SET DEFAULT (UUID());
ALTER TABLE product_variation_combinations ALTER COLUMN id SET DEFAULT (UUID());
ALTER TABLE product_variations ALTER COLUMN id SET DEFAULT (UUID());
ALTER TABLE products ALTER COLUMN id SET DEFAULT (UUID());
ALTER TABLE reviews ALTER COLUMN id SET DEFAULT (UUID());
ALTER TABLE shipping_zones ALTER COLUMN id SET DEFAULT (UUID());
ALTER TABLE system_settings ALTER COLUMN id SET DEFAULT (UUID());
ALTER TABLE users ALTER COLUMN id SET DEFAULT (UUID());
ALTER TABLE website_pages ALTER COLUMN id SET DEFAULT (UUID());

-- Verify the fixes worked
SELECT 'AFTER FIX - blog_categories' as table_name, COUNT(*) as total, COUNT(CASE WHEN id IS NULL OR id = '' THEN 1 END) as empty_ids FROM blog_categories
UNION ALL
SELECT 'AFTER FIX - blog_comments' as table_name, COUNT(*) as total, COUNT(CASE WHEN id IS NULL OR id = '' THEN 1 END) as empty_ids FROM blog_comments
UNION ALL
SELECT 'AFTER FIX - blog_posts' as table_name, COUNT(*) as total, COUNT(CASE WHEN id IS NULL OR id = '' THEN 1 END) as empty_ids FROM blog_posts
UNION ALL
SELECT 'AFTER FIX - categories' as table_name, COUNT(*) as total, COUNT(CASE WHEN id IS NULL OR id = '' THEN 1 END) as empty_ids FROM categories
UNION ALL
SELECT 'AFTER FIX - products' as table_name, COUNT(*) as total, COUNT(CASE WHEN id IS NULL OR id = '' THEN 1 END) as empty_ids FROM products
UNION ALL
SELECT 'AFTER FIX - users' as table_name, COUNT(*) as total, COUNT(CASE WHEN id IS NULL OR id = '' THEN 1 END) as empty_ids FROM users
UNION ALL
SELECT 'AFTER FIX - orders' as table_name, COUNT(*) as total, COUNT(CASE WHEN id IS NULL OR id = '' THEN 1 END) as empty_ids FROM orders
UNION ALL
SELECT 'AFTER FIX - order_items' as table_name, COUNT(*) as total, COUNT(CASE WHEN id IS NULL OR id = '' THEN 1 END) as empty_ids FROM order_items;