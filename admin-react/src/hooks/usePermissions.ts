import { useAuth } from '@/contexts/AuthContext';

// Define permissions enum matching backend
export enum Permission {
  // Dashboard & Analytics
  VIEW_DASHBOARD = 'view_dashboard',
  VIEW_ANALYTICS = 'view_analytics',
  VIEW_ADVANCED_ANALYTICS = 'view_advanced_analytics',
  
  // User Management
  VIEW_USERS = 'view_users',
  CREATE_USERS = 'create_users',
  EDIT_USERS = 'edit_users',
  DELETE_USERS = 'delete_users',
  MANAGE_USER_ROLES = 'manage_user_roles',
  
  // Product Management
  VIEW_PRODUCTS = 'view_products',
  CREATE_PRODUCTS = 'create_products',
  EDIT_PRODUCTS = 'edit_products',
  DELETE_PRODUCTS = 'delete_products',
  MANAGE_INVENTORY = 'manage_inventory',
  
  // Category Management
  VIEW_CATEGORIES = 'view_categories',
  CREATE_CATEGORIES = 'create_categories',
  EDIT_CATEGORIES = 'edit_categories',
  DELETE_CATEGORIES = 'delete_categories',
  
  // Order Management
  VIEW_ORDERS = 'view_orders',
  EDIT_ORDERS = 'edit_orders',
  UPDATE_ORDER_STATUS = 'update_order_status',
  CANCEL_ORDERS = 'cancel_orders',
  PROCESS_REFUNDS = 'process_refunds',
  
  // System Settings
  VIEW_SETTINGS = 'view_settings',
  EDIT_SETTINGS = 'edit_settings',
  MANAGE_SYSTEM = 'manage_system',
  
  // Shipping Management
  VIEW_SHIPPING_ZONES = 'view_shipping_zones',
  MANAGE_SHIPPING_ZONES = 'manage_shipping_zones',
  
  // Coupon Management
  VIEW_COUPONS = 'view_coupons',
  CREATE_COUPONS = 'create_coupons',
  EDIT_COUPONS = 'edit_coupons',
  DELETE_COUPONS = 'delete_coupons',
  
  // Newsletter Management
  VIEW_NEWSLETTERS = 'view_newsletters',
  CREATE_NEWSLETTERS = 'create_newsletters',
  EDIT_NEWSLETTERS = 'edit_newsletters',
  DELETE_NEWSLETTERS = 'delete_newsletters',
  
  // Website Pages Management
  VIEW_WEBSITE_PAGES = 'view_website_pages',
  CREATE_WEBSITE_PAGES = 'create_website_pages',
  EDIT_WEBSITE_PAGES = 'edit_website_pages',
  DELETE_WEBSITE_PAGES = 'delete_website_pages',
  PUBLISH_WEBSITE_PAGES = 'publish_website_pages',
  
  // Blog Management
  VIEW_BLOG = 'view_blog',
  CREATE_BLOG_POSTS = 'create_blog_posts',
  EDIT_BLOG_POSTS = 'edit_blog_posts',
  DELETE_BLOG_POSTS = 'delete_blog_posts',
  PUBLISH_BLOG_POSTS = 'publish_blog_posts',
  MANAGE_BLOG_CATEGORIES = 'manage_blog_categories',
  MANAGE_BLOG_TAGS = 'manage_blog_tags',
  MODERATE_BLOG_COMMENTS = 'moderate_blog_comments',
  
  // Reports & Exports
  EXPORT_DATA = 'export_data',
  VIEW_REPORTS = 'view_reports',
  GENERATE_REPORTS = 'generate_reports'
}

// Role-based permissions mapping (EXACTLY matching backend)
export const ROLE_PERMISSIONS: Record<string, Permission[]> = {
  customer: [
    // Customers have no admin permissions
  ],
  
  staff: [
    // Dashboard (Limited - Order-focused)
    Permission.VIEW_DASHBOARD,
    
    // Order Management (Full Access)
    Permission.VIEW_ORDERS,
    Permission.EDIT_ORDERS,
    Permission.UPDATE_ORDER_STATUS,
    Permission.CANCEL_ORDERS,
    Permission.PROCESS_REFUNDS,
    
    // Reports (Order-related only)
    Permission.VIEW_REPORTS,
    Permission.EXPORT_DATA
  ],
  
  manager: [
    // Dashboard & Analytics (Limited)
    Permission.VIEW_DASHBOARD,
    Permission.VIEW_ANALYTICS,
    
    // Product Management (Full)
    Permission.VIEW_PRODUCTS,
    Permission.CREATE_PRODUCTS,
    Permission.EDIT_PRODUCTS,
    Permission.DELETE_PRODUCTS,
    Permission.MANAGE_INVENTORY,
    
    // Category Management (Full)
    Permission.VIEW_CATEGORIES,
    Permission.CREATE_CATEGORIES,
    Permission.EDIT_CATEGORIES,
    Permission.DELETE_CATEGORIES,
    
    // Order Management (Full)
    Permission.VIEW_ORDERS,
    Permission.EDIT_ORDERS,
    Permission.UPDATE_ORDER_STATUS,
    Permission.CANCEL_ORDERS,
    Permission.PROCESS_REFUNDS,
    
    // Coupon Management (Full)
    Permission.VIEW_COUPONS,
    Permission.CREATE_COUPONS,
    Permission.EDIT_COUPONS,
    Permission.DELETE_COUPONS,
    
    // Newsletter Management (Full)
    Permission.VIEW_NEWSLETTERS,
    Permission.CREATE_NEWSLETTERS,
    Permission.EDIT_NEWSLETTERS,
    Permission.DELETE_NEWSLETTERS,
    
    // Website Pages Management (Full - MISSING DELETE_WEBSITE_PAGES)
    Permission.VIEW_WEBSITE_PAGES,
    Permission.CREATE_WEBSITE_PAGES,
    Permission.EDIT_WEBSITE_PAGES,
    Permission.PUBLISH_WEBSITE_PAGES,
    
    // Blog Management (Full)
    Permission.VIEW_BLOG,
    Permission.CREATE_BLOG_POSTS,
    Permission.EDIT_BLOG_POSTS,
    Permission.PUBLISH_BLOG_POSTS,
    Permission.MANAGE_BLOG_CATEGORIES,
    Permission.MANAGE_BLOG_TAGS,
    Permission.MODERATE_BLOG_COMMENTS,
    
    // Shipping Management (Operational)
    Permission.VIEW_SHIPPING_ZONES,
    Permission.MANAGE_SHIPPING_ZONES,
    
    // User Management (Read Only - NO CREATE/EDIT/DELETE)
    Permission.VIEW_USERS,
    
    // Reports (Limited)
    Permission.VIEW_REPORTS,
    Permission.EXPORT_DATA
  ],
  
  admin: [
    // Full access to everything
    ...Object.values(Permission)
  ]
};

/**
 * Hook for checking user permissions
 */
export const usePermissions = () => {
  const { user } = useAuth();

  const getUserPermissions = (userRole?: string): Permission[] => {
    if (!userRole) return [];
    return ROLE_PERMISSIONS[userRole] || [];
  };

  const hasPermission = (permission: Permission): boolean => {
    if (!user?.role) return false;
    const rolePermissions = getUserPermissions(user.role);
    return rolePermissions.includes(permission);
  };

  const hasAnyPermission = (permissions: Permission[]): boolean => {
    return permissions.some(permission => hasPermission(permission));
  };

  const hasAllPermissions = (permissions: Permission[]): boolean => {
    return permissions.every(permission => hasPermission(permission));
  };

  const isAdmin = (): boolean => {
    return user?.role === 'admin';
  };

  const isManager = (): boolean => {
    return user?.role === 'manager';
  };

  const isStaff = (): boolean => {
    return user?.role === 'staff';
  };

  const canAccessAdmin = (): boolean => {
    return ['admin', 'manager', 'staff'].includes(user?.role || '');
  };

  return {
    user,
    permissions: getUserPermissions(user?.role),
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    isAdmin,
    isManager,
    isStaff,
    canAccessAdmin
  };
};