import nodemailer from 'nodemailer';
import pool from './database';

// Email configuration interface
export interface EmailConfig {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
}

// Create email transporter
export const createEmailTransporter = async () => {
  const emailService = process.env.EMAIL_SERVICE || 'smtp';
  
  if (emailService === 'gmail') {
    return createGmailTransporter();
  } else {
    return await createSMTPTransporter();
  }
};

// Simple Gmail transporter (for development)
const createGmailTransporter = () => {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_FROM || 'noreply@freshcounty.com',
      pass: process.env.EMAIL_PASSWORD || 'your-app-password'
    }
  });
};

// Load email settings from database
const loadEmailSettingsFromDB = async () => {
  try {
    const [rows] = await pool.execute(`
      SELECT setting_key, setting_value 
      FROM system_settings 
      WHERE category = 'email' 
      AND setting_key IN ('smtp_host', 'smtp_port', 'smtp_username', 'smtp_password')
    `);
    
    const settings: Record<string, string> = {};
    (rows as any[]).forEach(row => {
      settings[row.setting_key] = row.setting_value;
    });
    
    return settings;
  } catch (error) {
    console.error('Failed to load email settings from database:', error);
    return {};
  }
};

// SMTP transporter (for custom SMTP servers)
const createSMTPTransporter = async () => {
  // Try to load settings from database first
  const dbSettings = await loadEmailSettingsFromDB();
  
  // Use database settings if available, fallback to env
  const host = dbSettings.smtp_host || process.env.SMTP_HOST || 'localhost';
  const port = parseInt(dbSettings.smtp_port || process.env.SMTP_PORT || '587');
  const user = dbSettings.smtp_username || process.env.SMTP_USER || 'noreply@freshcounty.com';
  const pass = dbSettings.smtp_password || process.env.SMTP_PASSWORD || 'password';
  
  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465, // Use secure only for port 465
    auth: { user, pass },
    tls: {
      rejectUnauthorized: process.env.NODE_ENV === 'production'
    }
  });
};

// Email verification
export const verifyEmailConnection = async () => {
  try {
    const transporter = await createEmailTransporter();
    await transporter.verify();
    console.log('✅ Email service connected successfully');
    return true;
  } catch (error) {
    console.error('❌ Email service connection failed:', error);
    return false;
  }
};

// Default email configuration
export const defaultEmailConfig = {
  from: process.env.EMAIL_FROM || 'Fresh County <noreply@freshcounty.com>',
  replyTo: process.env.EMAIL_REPLY_TO || 'support@freshcounty.com',
  companyName: 'Fresh County',
  companyAddress: {
    street: '123 Farm Street',
    city: 'Lagos',
    state: 'Lagos State',
    country: 'Nigeria',
    zipCode: '100001'
  },
  supportEmail: 'support@freshcounty.com',
  supportPhone: '+234-800-FRESH-1',
  websiteUrl: process.env.FRONTEND_URL || 'https://freshcounty.com',
  logoUrl: `${process.env.FRONTEND_URL || 'https://freshcounty.com'}/logo.png`,
  socialMedia: {
    facebook: 'https://facebook.com/freshcounty',
    instagram: 'https://instagram.com/freshcounty',
    twitter: 'https://twitter.com/freshcounty'
  }
};