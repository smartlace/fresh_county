'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';

interface SettingsContextType {
  siteName: string;
  loading: boolean;
  refreshSettings: () => Promise<void>;
  forceRefreshSettings: () => Promise<void>;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [siteName, setSiteName] = useState('Fresh County'); // Default fallback
  const [loading, setLoading] = useState(false); // Changed to false initially
  const [settingsLoaded, setSettingsLoaded] = useState(false); // Track if settings have been loaded

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://freshcounty.com/api';

  const getAuthHeaders = useCallback(() => {
    const token = typeof window !== 'undefined' 
      ? localStorage.getItem('admin_token') || sessionStorage.getItem('admin_token')
      : null;
    
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  }, []);

  const refreshSettings = useCallback(async () => {
    // Skip if already loaded and not forcing refresh
    if (settingsLoaded) {
      return;
    }
    
    // Only fetch if we have a token
    const token = typeof window !== 'undefined' 
      ? localStorage.getItem('admin_token') || sessionStorage.getItem('admin_token')
      : null;
      
    if (!token) {
      setSiteName('Fresh County');
      setLoading(false);
      setSettingsLoaded(true);
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/admin/settings`, {
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
      setSettingsLoaded(true);
    } catch (error) {
      console.error('Failed to load settings:', error);
      setSiteName('Fresh County'); // Fallback on error
      setSettingsLoaded(true);
    } finally {
      setLoading(false);
    }
  }, [API_BASE_URL, getAuthHeaders, settingsLoaded]);

  // Force refresh settings (ignores settingsLoaded flag)
  const forceRefreshSettings = useCallback(async () => {
    setSettingsLoaded(false);
    await refreshSettings();
  }, [refreshSettings]);

  // Remove automatic settings fetch on mount
  // Settings will be fetched when explicitly called

  const value: SettingsContextType = {
    siteName,
    loading,
    refreshSettings,
    forceRefreshSettings
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