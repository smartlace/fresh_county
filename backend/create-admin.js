const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
require('dotenv').config();

async function createAdminUser() {
  try {
    // Database connection
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'ecommerce_db'
    });

    console.log('Connected to database');

    // Check if admin user exists
    const [existingUsers] = await connection.execute(
      'SELECT id, email, role FROM users WHERE email = ? AND role = ?',
      ['admin@example.com', 'admin']
    );

    if (existingUsers.length > 0) {
      // Update user to ensure they're active and have necessary fields
      await connection.execute(`
        UPDATE users 
        SET role = 'admin'
        WHERE email = ?
      `, ['admin@example.com']);
      
      console.log('Admin user already exists and updated:');
      console.log('Email: admin@example.com');
      console.log('Password: admin123');
      console.log('Role: admin');
    } else {
      // Create admin user
      const hashedPassword = await bcrypt.hash('admin123', 12);
      
      await connection.execute(`
        INSERT INTO users (email, password, first_name, last_name, role) 
        VALUES (?, ?, ?, ?, ?)
      `, ['admin@example.com', hashedPassword, 'Admin', 'User', 'admin']);

      console.log('Admin user created successfully!');
      console.log('Email: admin@example.com');
      console.log('Password: admin123');
      console.log('Role: admin');
    }

    await connection.end();
  } catch (error) {
    console.error('Error:', error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.log('\n❌ Database connection failed. Please ensure MySQL is running.');
    } else if (error.code === 'ER_BAD_DB_ERROR') {
      console.log('\n❌ Database "ecommerce_db" does not exist. Please run the schema.sql file first.');
    }
  }
}

createAdminUser();