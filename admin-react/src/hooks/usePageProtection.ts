'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { usePermissions, Permission } from './usePermissions';
import toast from 'react-hot-toast';

/**
 * Hook to protect pages based on user permissions
 * Redirects unauthorized users to dashboard with an error message
 */
export const usePageProtection = (requiredPermissions: Permission[]) => {
  const { hasAnyPermission } = usePermissions();
  const router = useRouter();

  useEffect(() => {
    // If no permissions required, allow access
    if (requiredPermissions.length === 0) return;

    // Check if user has any of the required permissions
    if (!hasAnyPermission(requiredPermissions)) {
      toast.error('You don\'t have permission to access this page');
      router.replace('/dashboard');
    }
  }, [hasAnyPermission, requiredPermissions, router]);

  // Return whether user has access
  return requiredPermissions.length === 0 || hasAnyPermission(requiredPermissions);
};

interface PageProtectionProps {
  requiredPermissions: Permission[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

/**
 * Page protection wrapper component
 */
export const PageProtection: React.FC<PageProtectionProps> = ({ 
  requiredPermissions, 
  children, 
  fallback 
}) => {
  const hasAccess = usePageProtection(requiredPermissions);

  if (!hasAccess) {
    return fallback || null;
  }

  return children as React.ReactElement;
};