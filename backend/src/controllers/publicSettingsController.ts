import { Request, Response, NextFunction } from 'express';
import pool from '../config/database';

interface ApiResponse {
  success: boolean;
  message: string;
  data?: any;
}

/**
 * Get public settings (bank details for payment modal)
 */
export const getPublicBankDetails = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Only fetch bank-related settings that are safe to expose publicly
    const [rows] = await pool.execute(`
      SELECT setting_key, setting_value 
      FROM system_settings 
      WHERE setting_key IN ('bank_name', 'account_number', 'account_name')
      AND setting_key IS NOT NULL
    `);

    const settings: { [key: string]: string } = {};

    // Transform database results to key-value pairs
    if (Array.isArray(rows)) {
      rows.forEach((row: any) => {
        if (row.setting_key && row.setting_value) {
          settings[row.setting_key] = row.setting_value;
        }
      });
    }

    // Provide default values if not found in database
    const bankDetails = {
      bank_name: settings.bank_name || 'First Bank of Nigeria',
      account_number: settings.account_number || '1234567890', 
      account_name: settings.account_name || 'Fresh County Nigeria Limited'
    };

    const response: ApiResponse = {
      success: true,
      message: 'Bank details retrieved successfully',
      data: { bankDetails }
    };

    res.status(200).json(response);

  } catch (error: any) {
    console.error('Error fetching bank details:', error);
    
    // Return default bank details if database fails
    const response: ApiResponse = {
      success: true,
      message: 'Bank details retrieved (default)',
      data: { 
        bankDetails: {
          bank_name: 'First Bank of Nigeria',
          account_number: '1234567890',
          account_name: 'Fresh County Nigeria Limited'
        }
      }
    };
    
    res.status(200).json(response);
  }
};