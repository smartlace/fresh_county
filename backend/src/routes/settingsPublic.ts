import express from 'express';
import { pool } from '../config/database';

const router = express.Router();

// Get under construction status (public endpoint)
router.get('/under-construction', async (req, res, next) => {
  let connection;
  
  try {
    connection = await pool.getConnection();
    
    // Get the under construction mode setting
    const [rows] = await connection.execute(
      'SELECT setting_value FROM system_settings WHERE setting_key = ?',
      ['under_construction_mode']
    );
    
    const settings = rows as any[];
    const underConstructionSetting = settings[0];
    
    // Default to false if setting doesn't exist
    let underConstruction = false;
    
    if (underConstructionSetting) {
      // Handle both string and boolean values
      const value = underConstructionSetting.setting_value;
      underConstruction = value === 'true' || value === true || value === 1;
    }
    
    res.json({
      success: true,
      underConstruction
    });
    
  } catch (error) {
    console.error('Error checking under construction mode:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check under construction mode',
      underConstruction: false // Fail safe - don't block access if there's an error
    });
  } finally {
    if (connection) {
      connection.release();
    }
  }
});

export default router;