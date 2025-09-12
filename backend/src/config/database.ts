import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

interface DatabaseConfig {
  host: string;
  port: number;
  user: string;
  password: string;
  database: string;
  waitForConnections: boolean;
  connectionLimit: number;
  queueLimit: number;
}

// Validate required environment variables
if (!process.env.DB_PASSWORD) {
  throw new Error('DB_PASSWORD environment variable is required for security');
}

const config: DatabaseConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME || 'ecommerce_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
};

export const pool = mysql.createPool(config);

export const connectDatabase = async () => {
  try {
    const connection = await pool.getConnection();
    console.log('Connected to MySQL Database');
    connection.release();
  } catch (error) {
    console.error('Database connection failed:', error);
    throw error;
  }
};

export default pool;