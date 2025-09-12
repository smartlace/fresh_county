const mysql = require('mysql2/promise');
require('dotenv').config();

async function checkSettingsTable() {
  let connection;
  
  try {
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '3306'),
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME || 'ecommerce_db'
    });

    console.log('Connected to MySQL Database');

    // Check table structure
    const [columns] = await connection.execute(`DESCRIBE system_settings`);
    console.log('📋 system_settings table structure:');
    columns.forEach(col => {
      console.log(`  ${col.Field}: ${col.Type} ${col.Null} ${col.Key} ${col.Default}`);
    });

    // Check existing settings
    const [rows] = await connection.execute(`
      SELECT setting_key, setting_value, category, data_type 
      FROM system_settings 
      ORDER BY category, setting_key
    `);

    console.log('\n📋 Existing settings:');
    rows.forEach(row => {
      console.log(`  ${row.setting_key} (${row.category}): ${row.setting_value}`);
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

checkSettingsTable();