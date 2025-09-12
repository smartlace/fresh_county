const mysql = require('mysql2/promise');
require('dotenv').config();

(async () => {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME
    });
    
    console.log('=== Products Table Structure ===');
    const [productCols] = await connection.execute('DESCRIBE products');
    productCols.forEach(col => console.log(`${col.Field}: ${col.Type}`));
    
    console.log('\n=== Orders Table Structure ===');
    const [orderCols] = await connection.execute('DESCRIBE orders');
    orderCols.forEach(col => console.log(`${col.Field}: ${col.Type}`));
    
    console.log('\n=== Check Tables Exist ===');
    const [tables] = await connection.execute('SHOW TABLES');
    console.log('Available tables:', tables.map(t => Object.values(t)[0]));
    
    await connection.end();
  } catch (error) {
    console.error('Error:', error.message);
  }
})();