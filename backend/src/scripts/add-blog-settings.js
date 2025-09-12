const mysql = require('mysql2/promise');
require('dotenv').config();

async function addBlogSettings() {
  let connection;
  
  try {
    // Create database connection
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '3306'),
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME || 'ecommerce_db'
    });

    console.log('Connected to MySQL Database');

    // First, add 'blog' to the category enum
    await connection.execute(`
      ALTER TABLE system_settings 
      MODIFY COLUMN category ENUM('general','tax_shipping','email','security','payment','blog') NOT NULL DEFAULT 'general'
    `);

    // Insert blog settings
    await connection.execute(`
      INSERT INTO system_settings (setting_key, setting_value, description, category, data_type, created_at, updated_at) 
      VALUES 
        ('blog_page_title', 'BLOG LISTS', 'Title displayed on the main blog page', 'blog', 'text', NOW(), NOW()),
        ('blog_page_subtitle', 'Offer a range of fresh juices, smoothies, parfaits, salads, wraps, and other healthy options', 'Subtitle displayed on the main blog page', 'blog', 'text', NOW(), NOW())
      ON DUPLICATE KEY UPDATE 
        setting_value = VALUES(setting_value), 
        description = VALUES(description),
        updated_at = NOW()
    `);

    console.log('✅ Blog settings added successfully');

    // Verify the settings were added
    const [rows] = await connection.execute(`
      SELECT setting_key, setting_value, description, category 
      FROM system_settings 
      WHERE setting_key IN ('blog_page_title', 'blog_page_subtitle')
    `);

    console.log('📋 Current blog settings:');
    rows.forEach(row => {
      console.log(`  ${row.setting_key}: ${row.setting_value}`);
    });

  } catch (error) {
    console.error('❌ Error adding blog settings:', error.message);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      console.log('Database connection closed');
    }
  }
}

addBlogSettings();