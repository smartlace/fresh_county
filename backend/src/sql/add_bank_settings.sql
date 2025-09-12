-- Add bank account settings to system_settings table
-- This script adds bank name and account number settings for Fresh County

INSERT INTO system_settings (setting_key, setting_value, description, category, data_type, options, created_at, updated_at) 
VALUES 
(
  'bank_name', 
  'First Bank of Nigeria', 
  'Name of the bank where Fresh County business account is held',
  'payment',
  'text',
  NULL,
  NOW(),
  NOW()
),
(
  'account_number', 
  '1234567890', 
  'Fresh County business account number for customer payments',
  'payment',
  'text',
  NULL,
  NOW(),
  NOW()
),
(
  'account_name', 
  'Fresh County Nigeria Limited', 
  'Account holder name for the business bank account',
  'payment',
  'text',
  NULL,
  NOW(),
  NOW()
)
ON DUPLICATE KEY UPDATE
  description = VALUES(description),
  category = VALUES(category),
  data_type = VALUES(data_type),
  updated_at = NOW();