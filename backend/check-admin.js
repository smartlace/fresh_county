const mysql = require('mysql2/promise');
require('dotenv').config();

async function checkAdmin() {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'ecommerce_db'
    });

    console.log('Connected to database');

    // Check table structure
    console.log('\n=== Users Table Structure ===');
    const [columns] = await connection.execute('DESCRIBE users');
    columns.forEach(col => {
      console.log(`${col.Field}: ${col.Type} (${col.Null === 'YES' ? 'NULL' : 'NOT NULL'})`);
    });

    // Check admin user
    console.log('\n=== Admin User Record ===');
    const [users] = await connection.execute(
      'SELECT * FROM users WHERE email = ?',
      ['admin@example.com']
    );

    if (users.length > 0) {
      const user = users[0];
      console.log('ID:', user.id);
      console.log('Email:', user.email);
      console.log('First Name:', user.first_name);
      console.log('Last Name:', user.last_name);
      console.log('Role:', user.role);
      console.log('Password Hash (first 20 chars):', user.password.substring(0, 20) + '...');
      console.log('Created At:', user.created_at);
      
      // Check if status column exists
      if (user.hasOwnProperty('status')) {
        console.log('Status:', user.status);
      } else {
        console.log('Status column: NOT FOUND');
      }
    } else {
      console.log('Admin user not found');
    }

    await connection.end();
  } catch (error) {
    console.error('Error:', error.message);
  }
}

checkAdmin();