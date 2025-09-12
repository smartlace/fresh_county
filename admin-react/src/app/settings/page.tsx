'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import AuthenticatedLayout from '@/components/AuthenticatedLayout';
import toast from 'react-hot-toast';

interface Setting {
  key: string;
  value: string;
  type: 'text' | 'number' | 'email' | 'select' | 'boolean' | 'password';
  label: string;
  description?: string;
  options?: string[];
  category: 'general' | 'tax_shipping' | 'email' | 'security' | 'payment';
}

interface MFAStatus {
  mfaEnabled: boolean;
}

export default function Settings() {
  const { getMFAStatus, setupMFA, confirmMFA, disableMFA, generateBackupCodes } = useAuth();
  const [settings, setSettings] = useState<Setting[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [mfaStatus, setMFAStatus] = useState<MFAStatus>({ mfaEnabled: false });
  const [showMFASetup, setShowMFASetup] = useState(false);
  const [mfaSetupData, setMFASetupData] = useState<{ qr_code: string; secret: string } | null>(null);
  const [mfaToken, setMFAToken] = useState('');
  const [password, setPassword] = useState('');
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [showBackupCodes, setShowBackupCodes] = useState(false);
  const [settingsLoaded, setSettingsLoaded] = useState(false);
  const [showSmtpPassword, setShowSmtpPassword] = useState(false);

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

  // Default settings structure
  const defaultSettings: Setting[] = [
    // General Settings
    { key: 'site_name', value: 'Fresh County', type: 'text', label: 'Site Name', category: 'general' },
    { key: 'currency', value: 'NGN', type: 'select', label: 'Currency', options: ['NGN', 'USD', 'EUR'], category: 'general' },
    { key: 'timezone', value: 'Africa/Lagos', type: 'select', label: 'Timezone', options: ['Africa/Lagos', 'UTC', 'America/New_York'], category: 'general' },
    { key: 'under_construction_mode', value: 'false', type: 'boolean', label: 'Under Construction Mode', description: 'Enable to show maintenance page to visitors while keeping admin access', category: 'general' },
    
    // Tax & Shipping
    { key: 'tax_rate', value: '7.5', type: 'number', label: 'Tax Rate (%)', category: 'tax_shipping' },
    { key: 'free_shipping_threshold', value: '50000', type: 'number', label: 'Free Shipping Threshold', category: 'tax_shipping', description: 'Note: Shipping costs now managed via Shipping Zones page' },
    
    // Email Settings
    { key: 'admin_email', value: 'admin@freshcounty.ng', type: 'email', label: 'Admin Email', category: 'email' },
    { key: 'support_email', value: 'support@freshcounty.ng', type: 'email', label: 'Support Email', category: 'email' },
    { key: 'smtp_host', value: '', type: 'text', label: 'SMTP Host', category: 'email' },
    { key: 'smtp_port', value: '587', type: 'number', label: 'SMTP Port', category: 'email' },
    { key: 'smtp_username', value: '', type: 'text', label: 'SMTP Username', category: 'email' },
    { key: 'smtp_password', value: '', type: 'password', label: 'SMTP Password', description: 'Password for SMTP server authentication (stored securely)', category: 'email' },
    
    // Security Settings
    { key: 'password_min_length', value: '8', type: 'number', label: 'Minimum Password Length', category: 'security' },
    { key: 'session_timeout', value: '60', type: 'number', label: 'Session Timeout (minutes)', category: 'security' },
    { key: 'max_login_attempts', value: '5', type: 'number', label: 'Max Login Attempts', category: 'security' },
    
    // Payment Settings
    { key: 'paystack_public_key', value: '', type: 'text', label: 'Paystack Public Key', category: 'payment' },
    { key: 'paystack_secret_key', value: '', type: 'text', label: 'Paystack Secret Key', category: 'payment' },
    { key: 'payment_methods_enabled', value: 'card,bank_transfer', type: 'text', label: 'Enabled Payment Methods', category: 'payment' },
    
    // Bank Account Settings
    { key: 'bank_name', value: 'First Bank of Nigeria', type: 'text', label: 'Bank Name', description: 'Name of the bank where Fresh County business account is held', category: 'payment' },
    { key: 'account_number', value: '1234567890', type: 'text', label: 'Account Number', description: 'Fresh County business account number for customer payments', category: 'payment' },
    { key: 'account_name', value: 'Fresh County Nigeria Limited', type: 'text', label: 'Account Name', description: 'Account holder name for the business bank account', category: 'payment' },
  ];

  useEffect(() => {
    loadSettings();
    loadMFAStatus();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('admin_token') || sessionStorage.getItem('admin_token');
      
      const response = await fetch(`${API_BASE_URL}/api/admin/settings`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Transform API settings to match frontend format
        const settingsArray: Setting[] = [];
        
        for (const [key, settingData] of Object.entries(data.data.settings)) {
          const apiSetting = settingData as Setting;
          settingsArray.push({
            key: key,
            value: apiSetting.value || '',
            type: apiSetting.type || 'text',
            label: key.split('_').map((word: string) => 
              word.charAt(0).toUpperCase() + word.slice(1)
            ).join(' '),
            description: apiSetting.description,
            options: apiSetting.options,
            category: apiSetting.category || 'general'
          });
        }
        
        // Merge with default settings for any missing ones
        const mergedSettings = defaultSettings.map(defaultSetting => {
          const apiSetting = settingsArray.find(s => s.key === defaultSetting.key);
          return apiSetting || defaultSetting;
        });
        
        setSettings(mergedSettings);
        setSettingsLoaded(true);
        
        // Auto-dismiss the success banner after 3 seconds
        setTimeout(() => {
          setSettingsLoaded(false);
        }, 3000);
      } else {
        // Use default settings if API call fails
        setSettings(defaultSettings);
        setSettingsLoaded(false);
        toast.error('Failed to load settings from server, using defaults');
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
      setSettings(defaultSettings);
    } finally {
      setLoading(false);
    }
  };

  const loadMFAStatus = async () => {
    try {
      const status = await getMFAStatus();
      setMFAStatus(status);
    } catch (error) {
      console.error('Failed to load MFA status:', error);
    }
  };

  const saveSettings = async () => {
    try {
      setSaving(true);
      const token = localStorage.getItem('admin_token') || sessionStorage.getItem('admin_token');
      
      const settingsData = settings.reduce((acc, setting) => {
        acc[setting.key] = setting.value;
        return acc;
      }, {} as Record<string, string>);

      const response = await fetch(`${API_BASE_URL}/api/admin/settings`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ settings: settingsData })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        toast.success('Settings saved successfully');
        // Reload settings to confirm the changes were saved
        await loadSettings();
      } else {
        toast.error(data.message || 'Failed to save settings');
      }
    } catch (error) {
      console.error('Failed to save settings:', error);
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const updateSetting = (key: string, value: string) => {
    setSettings(prev => prev.map(setting => 
      setting.key === key ? { ...setting, value } : setting
    ));
  };

  // Helper function to identify fields that should only accept integers
  const isIntegerField = (key: string) => {
    const integerFields = [
      'password_min_length',
      'session_timeout', 
      'max_login_attempts',
      'smtp_port'
    ];
    return integerFields.includes(key);
  };

  const resetSettings = async () => {
    if (confirm('Are you sure you want to reset all settings to default values? This action cannot be undone.')) {
      try {
        setSaving(true);
        
        // Set the UI to default settings first, but preserve restricted settings
        const currentCurrency = settings.find(s => s.key === 'currency')?.value || 'NGN';
        const currentTimezone = settings.find(s => s.key === 'timezone')?.value || 'Africa/Lagos';
        
        const resetSettingsWithRestricted = defaultSettings.map(setting => {
          if (setting.key === 'currency') {
            return { ...setting, value: currentCurrency };
          }
          if (setting.key === 'timezone') {
            return { ...setting, value: currentTimezone };
          }
          return setting;
        });
        
        setSettings(resetSettingsWithRestricted);
        
        // Prepare default settings data for API (excluding restricted fields)
        const settingsData = defaultSettings.reduce((acc, setting) => {
          // Skip currency and timezone as they are restricted
          if (setting.key !== 'currency' && setting.key !== 'timezone') {
            acc[setting.key] = setting.value;
          }
          return acc;
        }, {} as Record<string, string>);

        // Save defaults to database
        const token = localStorage.getItem('admin_token') || sessionStorage.getItem('admin_token');
        
        const response = await fetch(`${API_BASE_URL}/api/admin/settings`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          credentials: 'include',
          body: JSON.stringify({ settings: settingsData })
        });

        const data = await response.json();

        if (response.ok && data.success) {
          toast.success('Settings successfully reset to defaults and saved to database');
          // Reload settings to confirm the changes were saved
          await loadSettings();
        } else {
          toast.error(data.message || 'Failed to save default settings to database');
        }
      } catch (error) {
        console.error('Failed to reset settings:', error);
        toast.error('Failed to reset settings');
      } finally {
        setSaving(false);
      }
    }
  };

  const handleMFASetup = async () => {
    try {
      const data = await setupMFA();
      setMFASetupData(data);
      setShowMFASetup(true);
    } catch (error) {
      console.error('MFA setup failed:', error);
    }
  };

  const handleMFAConfirm = async () => {
    try {
      await confirmMFA(mfaToken);
      setShowMFASetup(false);
      setMFAToken('');
      setMFAStatus({ mfaEnabled: true });
      toast.success('MFA enabled successfully!');
    } catch (error) {
      console.error('MFA confirmation failed:', error);
    }
  };

  const handleMFADisable = async () => {
    try {
      await disableMFA(password, mfaToken);
      setPassword('');
      setMFAToken('');
      setMFAStatus({ mfaEnabled: false });
      toast.success('MFA disabled successfully!');
    } catch (error) {
      console.error('MFA disable failed:', error);
    }
  };

  const handleGenerateBackupCodes = async () => {
    try {
      const codes = await generateBackupCodes(password, mfaToken);
      setBackupCodes(codes);
      setShowBackupCodes(true);
      setPassword('');
      setMFAToken('');
    } catch (error) {
      console.error('Backup code generation failed:', error);
    }
  };

  const renderSettingsByCategory = (category: string) => {
    return settings
      .filter(setting => setting.category === category)
      .map(setting => (
        <div key={setting.key} className="mb-6 p-4 bg-gray-50 rounded-lg border">
          <label className="block text-sm font-medium text-gray-900 mb-2">
            {setting.label}
          </label>
          {setting.type === 'select' ? (
            <select
              value={setting.value}
              onChange={(e) => updateSetting(setting.key, e.target.value)}
              disabled={setting.key === 'currency' || setting.key === 'timezone'}
              className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors ${
                setting.key === 'currency' || setting.key === 'timezone' 
                  ? 'bg-gray-100 text-gray-600 cursor-not-allowed' 
                  : ''
              }`}
            >
              {setting.options?.map(option => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          ) : setting.type === 'boolean' ? (
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={setting.value === 'true'}
                onChange={(e) => updateSetting(setting.key, e.target.checked ? 'true' : 'false')}
                className="mr-3 h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
              />
              <span className="text-sm text-gray-600">{setting.description}</span>
            </label>
          ) : setting.key === 'smtp_password' ? (
            <div className="relative">
              <input
                type={showSmtpPassword ? 'text' : 'password'}
                value={setting.value}
                onChange={(e) => updateSetting(setting.key, e.target.value)}
                placeholder="Enter SMTP password"
                className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowSmtpPassword(!showSmtpPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
              >
                {showSmtpPassword ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 11-4.243-4.243m4.242 4.242L9.88 9.88" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.543 7-1.275 4.057-5.065 7-9.543 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
          ) : (
            <input
              type={setting.type}
              value={setting.value}
              onChange={(e) => updateSetting(setting.key, e.target.value)}
              onInput={(e) => {
                // For integer fields, remove any decimal points
                if (setting.type === 'number' && isIntegerField(setting.key)) {
                  const target = e.target as HTMLInputElement;
                  target.value = target.value.replace(/\D/g, '');
                }
              }}
              step={setting.type === 'number' && !isIntegerField(setting.key) ? '0.01' : '1'}
              min={setting.type === 'number' && isIntegerField(setting.key) ? '1' : undefined}
              disabled={setting.key === 'paystack_public_key' || setting.key === 'paystack_secret_key' || setting.key === 'payment_methods_enabled'}
              placeholder={
                setting.type === 'email' ? 'Enter email address' :
                setting.type === 'password' ? 'Enter password' :
                undefined
              }
              className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors ${
                setting.key === 'paystack_public_key' || setting.key === 'paystack_secret_key' || setting.key === 'payment_methods_enabled'
                  ? 'bg-gray-100 text-gray-600 cursor-not-allowed' 
                  : ''
              }`}
            />
          )}
          {setting.description && (
            <p className="text-sm text-gray-500 mt-2 italic">{setting.description}</p>
          )}
          {(setting.key === 'currency' || setting.key === 'timezone') && (
            <p className="text-xs text-orange-600 mt-1 flex items-center">
              <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              This setting is restricted and cannot be changed
            </p>
          )}
          {(setting.key === 'paystack_public_key' || setting.key === 'paystack_secret_key' || setting.key === 'payment_methods_enabled') && (
            <p className="text-xs text-orange-600 mt-1 flex items-center">
              <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              This payment setting is disabled and cannot be modified
            </p>
          )}
        </div>
      ));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <AuthenticatedLayout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">System Settings</h1>
        <div className="flex space-x-3">
          <button
            onClick={resetSettings}
            disabled={saving}
            className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 disabled:opacity-50 flex items-center"
          >
            {saving ? (
              <>
                <div className="spinner w-4 h-4 mr-2"></div>
                Resetting...
              </>
            ) : (
              <>
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Reset to Defaults
              </>
            )}
          </button>
          <button
            onClick={saveSettings}
            disabled={saving}
            className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 disabled:opacity-50 flex items-center"
          >
            {saving ? (
              <>
                <div className="spinner w-4 h-4 mr-2"></div>
                Saving...
              </>
            ) : (
              <>
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                Save Settings
              </>
            )}
          </button>
        </div>
      </div>

      {/* Settings Status Banner */}
      {settingsLoaded && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg animate-pulse transition-opacity duration-500">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-green-800 text-sm">Settings loaded from database successfully</span>
            </div>
            <button 
              onClick={() => setSettingsLoaded(false)}
              className="text-green-600 hover:text-green-800 ml-4"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* General Settings */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">General Settings</h3>
          {renderSettingsByCategory('general')}
        </div>

        {/* Tax & Shipping */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Tax & Shipping</h3>
          {renderSettingsByCategory('tax_shipping')}
        </div>

        {/* Email Settings */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Email Settings</h3>
          {renderSettingsByCategory('email')}
        </div>

        {/* Security Settings */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Security Settings</h3>
          {renderSettingsByCategory('security')}
          
          {/* MFA Settings */}
          <div className="mt-6 pt-6 border-t">
            <h4 className="text-md font-medium text-gray-900 mb-4">Multi-Factor Authentication</h4>
            {mfaStatus.mfaEnabled ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-md">
                  <div className="flex items-center">
                    <svg className="w-5 h-5 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-green-800 font-medium">MFA is enabled</span>
                  </div>
                </div>
                
                <div className="flex space-x-3">
                  <button
                    onClick={() => {
                      setPassword('');
                      setMFAToken('');
                      const modal = document.getElementById('disable-mfa-modal');
                      if (modal) modal.style.display = 'block';
                    }}
                    className="px-3 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm"
                  >
                    Disable MFA
                  </button>
                  <button
                    onClick={() => {
                      setPassword('');
                      setMFAToken('');
                      const modal = document.getElementById('backup-codes-modal');
                      if (modal) modal.style.display = 'block';
                    }}
                    className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
                  >
                    Generate New Backup Codes
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                  <div className="flex items-center">
                    <svg className="w-5 h-5 text-yellow-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.314 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                    <span className="text-yellow-800 font-medium">MFA is not enabled</span>
                  </div>
                </div>
                
                <button
                  onClick={handleMFASetup}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                >
                  Enable MFA
                </button>
                
                <p className="text-sm text-gray-600">
                  Multi-factor authentication adds an extra layer of security to your account by requiring a verification code from your mobile device.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Payment Settings */}
        <div className="bg-white p-6 rounded-lg shadow-sm border lg:col-span-2">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Settings</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {renderSettingsByCategory('payment')}
          </div>
        </div>
      </div>

      {/* MFA Setup Modal */}
      {showMFASetup && mfaSetupData && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-1/2 lg:w-1/3 shadow-lg rounded-md bg-white">
            <div className="text-center">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Set Up Multi-Factor Authentication</h3>
              
              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-4">
                  Scan this QR code with your authenticator app (Google Authenticator, Authy, etc.)
                </p>
                <div className="flex justify-center mb-4">
                  <img src={mfaSetupData.qrCodeUrl} alt="QR Code" className="border rounded" />
                </div>
                <p className="text-xs text-gray-500 mb-4">
                  Secret: {mfaSetupData.secret}
                </p>
              </div>

              <div className="mb-4">
                <input
                  type="text"
                  placeholder="Enter 6-digit code"
                  value={mfaToken}
                  onChange={(e) => setMFAToken(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div className="mb-4">
                <h4 className="font-medium mb-2">Backup Codes</h4>
                <p className="text-xs text-gray-600 mb-2">Save these codes in a safe place. You can use them to access your account if you lose your device.</p>
                <div className="bg-gray-100 p-2 rounded text-sm font-mono">
                  {mfaSetupData.backupCodes.map((code: string, index: number) => (
                    <div key={index}>{code}</div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowMFASetup(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                >
                  Cancel
                </button>
                <button
                  onClick={handleMFAConfirm}
                  disabled={mfaToken.length !== 6}
                  className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 disabled:opacity-50"
                >
                  Confirm
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Disable MFA Modal */}
      <div id="disable-mfa-modal" className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50" style={{ display: 'none' }}>
        <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-1/2 lg:w-1/3 shadow-lg rounded-md bg-white">
          <div className="text-center">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Disable Multi-Factor Authentication</h3>
            
            <div className="space-y-4">
              <input
                type="password"
                placeholder="Current Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
              
              <input
                type="text"
                placeholder="6-digit MFA Code"
                value={mfaToken}
                onChange={(e) => setMFAToken(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => {
                  const modal = document.getElementById('disable-mfa-modal');
                  if (modal) modal.style.display = 'none';
                }}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={handleMFADisable}
                disabled={!password || mfaToken.length !== 6}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
              >
                Disable MFA
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Backup Codes Modal */}
      <div id="backup-codes-modal" className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50" style={{ display: 'none' }}>
        <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-1/2 lg:w-1/3 shadow-lg rounded-md bg-white">
          <div className="text-center">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Generate New Backup Codes</h3>
            
            <div className="space-y-4">
              <input
                type="password"
                placeholder="Current Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
              
              <input
                type="text"
                placeholder="6-digit MFA Code"
                value={mfaToken}
                onChange={(e) => setMFAToken(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => {
                  const modal = document.getElementById('backup-codes-modal');
                  if (modal) modal.style.display = 'none';
                }}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={handleGenerateBackupCodes}
                disabled={!password || mfaToken.length !== 6}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                Generate Codes
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Show Backup Codes Modal */}
      {showBackupCodes && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-1/2 lg:w-1/3 shadow-lg rounded-md bg-white">
            <div className="text-center">
              <h3 className="text-lg font-bold text-gray-900 mb-4">New Backup Codes</h3>
              
              <p className="text-sm text-gray-600 mb-4">
                Save these codes in a safe place. Your old backup codes are now invalid.
              </p>
              
              <div className="bg-gray-100 p-4 rounded text-sm font-mono mb-4">
                {backupCodes.map((code, index) => (
                  <div key={index}>{code}</div>
                ))}
              </div>

              <button
                onClick={() => setShowBackupCodes(false)}
                className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
      </div>
    </AuthenticatedLayout>
  );
}