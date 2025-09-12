'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

interface SettingsContextType {
  siteName: string;
  loading: boolean;
  refreshSettings: () => Promise<void>;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [siteName, setSiteName] = useState('Fresh County'); // Default fallback
  const [loading, setLoading] = useState(true);

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

  const getAuthHeaders = () => {
    const token = typeof window !== 'undefined' 
      ? localStorage.getItem('admin_token') || sessionStorage.getItem('admin_token')
      : null;
    
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  };

  const refreshSettings = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/admin/settings`, {
        headers: getAuthHeaders(),
        credentials: 'include'
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Extract site name from settings
        const siteNameSetting = data.data.settings?.site_name;
        if (siteNameSetting && siteNameSetting.value) {
          setSiteName(siteNameSetting.value);
        } else {
          setSiteName('Fresh County'); // Fallback
        }
      } else {
        setSiteName('Fresh County'); // Fallback on error
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
      setSiteName('Fresh County'); // Fallback on error
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshSettings();
  }, []);

  const value: SettingsContextType = {
    siteName,
    loading,
    refreshSettings
  };

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}