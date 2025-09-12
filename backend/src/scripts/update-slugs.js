const mysql = require('mysql2/promise');
require('dotenv').config();

/**
 * Generate slug from name
 */
const generateSlug = (name) => {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9 -]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
};

/**
 * Ensure slug is unique by appending number if needed
 */
const ensureUniqueSlug = async (connection, table, baseSlug, excludeId = null) => {
  let slug = baseSlug;
  let counter = 1;

  while (true) {
    const query = excludeId 
      ? `SELECT id FROM ${table} WHERE slug = ? AND id != ?`
      : `SELECT id FROM ${table} WHERE slug = ?`;
    
    const params = excludeId ? [slug, excludeId] : [slug];
    const [existing] = await connection.execute(query, params);

    if (existing.length === 0) {
      return slug;
    }

    slug = `${baseSlug}-${counter}`;
    counter++;
  }
};

async function updateSlugs() {
  let connection;
  
  try {
    // Create database connection
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'fresh_county_db'
    });

    console.log('Connected to database');

    // Update products with missing slugs
    console.log('Updating products with missing slugs...');
    const [products] = await connection.execute(
      'SELECT id, name FROM products WHERE slug IS NULL OR slug = ""'
    );

    let productCount = 0;
    for (const product of products) {
      const baseSlug = generateSlug(product.name);
      const uniqueSlug = await ensureUniqueSlug(connection, 'products', baseSlug, product.id);
      
      await connection.execute(
        'UPDATE products SET slug = ? WHERE id = ?',
        [uniqueSlug, product.id]
      );
      
      console.log(`Updated product "${product.name}" → "${uniqueSlug}"`);
      productCount++;
    }

    // Update categories with missing slugs
    console.log('Updating categories with missing slugs...');
    const [categories] = await connection.execute(
      'SELECT id, name FROM categories WHERE slug IS NULL OR slug = ""'
    );

    let categoryCount = 0;
    for (const category of categories) {
      const baseSlug = generateSlug(category.name);
      const uniqueSlug = await ensureUniqueSlug(connection, 'categories', baseSlug, category.id);
      
      await connection.execute(
        'UPDATE categories SET slug = ? WHERE id = ?',
        [uniqueSlug, category.id]
      );
      
      console.log(`Updated category "${category.name}" → "${uniqueSlug}"`);
      categoryCount++;
    }

    console.log(`\nCompleted! Updated ${productCount} products and ${categoryCount} categories.`);

  } catch (error) {
    console.error('Error updating slugs:', error);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      console.log('Database connection closed');
    }
  }
}

// Run the script
updateSlugs();