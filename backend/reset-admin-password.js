const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
require('dotenv').config();

async function resetAdminPassword() {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'ecommerce_db'
    });

    console.log('Connected to database');

    // Generate new password hash using the same method as the backend
    const newPassword = 'admin123';
    const hashedPassword = await bcrypt.hash(newPassword, 12);
    
    console.log('New password hash generated');

    // Update admin user password
    await connection.execute(
      'UPDATE users SET password = ? WHERE email = ? AND role = ?',
      [hashedPassword, 'admin@example.com', 'admin']
    );

    console.log('Admin password updated successfully!');
    
    // Verify the update
    const [users] = await connection.execute(
      'SELECT email, first_name, last_name, role FROM users WHERE email = ?',
      ['admin@example.com']
    );

    if (users.length > 0) {
      console.log('\n=== Admin User Credentials ===');
      console.log('Email: admin@example.com');
      console.log('Password: admin123');
      console.log('Role:', users[0].role);
      console.log('Name:', users[0].first_name, users[0].last_name);
    }

    await connection.end();
  } catch (error) {
    console.error('Error:', error.message);
  }
}

resetAdminPassword();