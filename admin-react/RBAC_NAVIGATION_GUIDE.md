# RBAC Navigation Implementation Guide

## Overview
The admin panel now implements Role-Based Access Control (RBAC) navigation that exactly matches the backend permission system. Navigation items are completely hidden (not disabled) for users who don't have the required permissions.

## Backend RBAC Analysis

### Permission System
The backend defines 75+ granular permissions across 8 main categories:
- Dashboard & Analytics
- User Management  
- Product Management
- Category Management
- Order Management
- System Settings
- Content Management (Blog, Newsletters, Website Pages)
- Coupon Management
- Reports & Exports

### Role Permissions Matrix

#### Staff Role (Limited Access)
**Navigation Items Visible:**
- ✅ Dashboard
- ✅ Orders (full access)
- ✅ Settings (shipping-related access)
- ✅ Shipping (shipping management)
- ✅ Profile

**Permissions:**
- `VIEW_DASHBOARD`
- `VIEW_ORDERS`, `EDIT_ORDERS`, `UPDATE_ORDER_STATUS`, `CANCEL_ORDERS`, `PROCESS_REFUNDS`
- `VIEW_SETTINGS` (shipping-related access)
- `VIEW_REPORTS`, `EXPORT_DATA`

**Hidden Items:** Analytics, Products, Categories, Coupons, Newsletters, Website Pages, Blog, Users

#### Manager Role (Business Management)
**Navigation Items Visible:**
- ✅ Dashboard
- ✅ Analytics
- ✅ Orders (full access)
- ✅ Products (full management)
- ✅ Categories (full management)
- ✅ Coupons (full management)
- ✅ Newsletters (full management)
- ✅ Website Pages (create/edit/publish, no delete)
- ✅ Blog (full management)
- ✅ Users (view-only)
- ✅ Settings (view/edit, no system management)
- ✅ Shipping (via settings permissions)
- ✅ Profile

**Key Limitations:**
- No user creation/editing/deletion (view-only)
- No website pages deletion
- No advanced analytics
- No system management

**Hidden Items:** None (has access to all navigation items)

#### Admin Role (Full Access)
**Navigation Items Visible:**
- ✅ All navigation items with full permissions

## Implementation Details

### Frontend Components

#### 1. usePermissions Hook (`src/hooks/usePermissions.ts`)
- Exactly mirrors backend `ROLE_PERMISSIONS` mapping
- Provides permission checking functions:
  - `hasPermission(permission)` - Check single permission
  - `hasAnyPermission(permissions)` - Check if user has any of the permissions
  - `hasAllPermissions(permissions)` - Check if user has all permissions
  - Role helper functions: `isAdmin()`, `isManager()`, `isStaff()`, `canAccessAdmin()`

#### 2. Navigation Component (`src/components/Navigation.tsx`)
- Each navigation item specifies required permissions
- Uses `useMemo` to filter items based on user permissions
- Navigation updates automatically when user role changes
- Comments show which roles can see each item

#### 3. Page Protection Hook (`src/hooks/usePageProtection.ts`)
- Provides route-level protection beyond navigation
- Automatically redirects unauthorized users to dashboard
- Shows toast notification explaining access denial
- Can be used as hook or wrapper component

### Navigation Item Permissions

```typescript
// Example navigation item configuration
{
  name: 'Products',
  href: '/products', 
  icon: '...',
  requiredPermissions: [Permission.VIEW_PRODUCTS]
  // Staff: NO, Manager: YES, Admin: YES
}
```

### Testing RBAC Navigation

#### Test Scenarios:

1. **Staff User Login**
   - Should see: Dashboard, Orders, Settings, Shipping, Profile
   - Should not see: Analytics, Products, Categories, Coupons, Users, etc.

2. **Manager User Login**
   - Should see: All items except advanced admin features
   - Should have business management capabilities

3. **Admin User Login**
   - Should see: All navigation items
   - Should have full system access

## Security Features

### Multi-Layer Protection
1. **Navigation Filtering** - Hide unauthorized menu items
2. **Route Protection** - Middleware checks for valid authentication
3. **Page-Level Guards** - Individual pages can implement additional checks
4. **API Permissions** - Backend validates all API requests

### Error Handling
- Invalid access attempts show friendly error messages
- Automatic redirect to appropriate page (usually dashboard)
- Maintains user session while denying specific access

## Development Guidelines

### Adding New Navigation Items
1. Define required permission in backend `Permission` enum
2. Add permission to appropriate roles in `ROLE_PERMISSIONS`
3. Add navigation item with `requiredPermissions` array
4. Test with different user roles

### Adding New Permissions
1. Update backend `Permission` enum
2. Update backend `ROLE_PERMISSIONS` mapping
3. Update frontend `Permission` enum in usePermissions.ts
4. Update frontend `ROLE_PERMISSIONS` mapping
5. Add to appropriate navigation items

### Best Practices
- Always use `Permission` enum values, never hardcode strings
- Keep frontend and backend permission mappings in sync
- Use descriptive permission names that clearly indicate scope
- Test with all user roles when making permission changes
- Document permission requirements for new features

## Deployment Notes

The RBAC navigation system is included in the latest build and deployment package. No additional configuration is required on the server side - it works automatically with the existing backend authentication system.

## Troubleshooting

### Common Issues
1. **User sees items they shouldn't** - Check role permissions mapping
2. **User can't see items they should** - Verify permission requirements
3. **Navigation not updating** - Check if `hasAnyPermission` hook is working
4. **Build errors** - Ensure Permission enum values match between frontend/backend

### Debug Tools
- Console logs in development show current user permissions
- Navigation component shows permission requirements in comments
- usePermissions hook provides role checking functions for debugging