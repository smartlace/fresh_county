# Fresh County - Implementation Standards & Best Practices

## Overview
This document outlines the standardized implementation patterns for user authentication, cart management, and data persistence in the Fresh County e-commerce application.

## Architecture Principles

### 1. Centralized Storage Management
- **File**: `/src/lib/storage.ts`
- **Purpose**: Unified localStorage operations with error handling
- **Benefits**: Consistent naming, type safety, automatic error recovery

```typescript
// Example usage
import { SafeStorage, STORAGE_KEYS, UserStateManager } from '@/lib/storage';

// Safe get with fallback
const user = SafeStorage.get(STORAGE_KEYS.USER, null);

// Validated cart items
const cartItems = ShoppingStateManager.getCartItems();
```

### 2. User State Management

#### Authentication States
- **Authenticated User**: Has valid token + user data
- **Guest User**: No authentication, limited features
- **Invalid State**: Corrupted data, auto-cleared

#### Best Practices
```typescript
// Check user state
const { isAuthenticated, user, isGuest, canApplyDiscounts } = UserStateManager.getUserState();

// Handle login
UserStateManager.handleLogin(token, refreshToken, user);

// Handle logout with data clearing
UserStateManager.handleLogout(true); // clears shopping data
```

### 3. Cart & Shopping Data Management

#### Data Persistence Strategy
- **Guest Users**: Cart persists in localStorage until cleared
- **Authenticated Users**: Cart persists + discount codes available
- **Logout**: All shopping data cleared automatically

#### Validation & Error Handling
- Cart items validated on load (structure, positive quantities)
- Corrupted data automatically removed
- Discounts validated (positive amounts, required fields)

```typescript
// Validated operations
const items = ShoppingStateManager.getCartItems(); // Always returns valid array
const discount = ShoppingStateManager.getAppliedDiscount(); // Validated or null
```

## Implementation Patterns

### 1. Context Patterns

#### AuthContext
```typescript
const clearAuthState = async () => {
  setUser(null);
  setIsAuthenticated(false);
  UserStateManager.handleLogout(true); // Standardized cleanup
};
```

#### CartContext
```typescript
// Standardized initialization
useEffect(() => {
  const savedItems = ShoppingStateManager.getCartItems();
  const savedDelivery = ShoppingStateManager.getDeliveryType();
  const savedDiscount = ShoppingStateManager.getAppliedDiscount();
  
  setItems(savedItems);
  setDeliveryType(savedDelivery);
  if (savedDiscount) {
    setDiscountState({ appliedDiscount: savedDiscount, isValidating: false, error: null });
  }
}, []);
```

### 2. Event-Driven Communication

#### Cross-Context Communication
```typescript
// AuthContext dispatches logout event
window.dispatchEvent(new CustomEvent('userLogout'));

// CartContext listens and responds
useEffect(() => {
  const handleLogout = () => clearAllCartData();
  window.addEventListener('userLogout', handleLogout);
  return () => window.removeEventListener('userLogout', handleLogout);
}, []);
```

### 3. Error Handling Patterns

#### Safe Storage Operations
```typescript
// Automatic error handling with fallback
static get<T>(key: StorageKey, defaultValue: T | null = null): T | null {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error(`Storage error (${key}):`, error);
    SafeStorage.remove(key); // Auto-cleanup corrupted data
    return defaultValue;
  }
}
```

#### Data Validation
```typescript
// Validate cart items on load
return items.filter(item => 
  item && 
  typeof item === 'object' &&
  typeof item.id === 'string' &&
  typeof item.quantity === 'number' &&
  item.quantity > 0
);
```

## Feature Implementation Standards

### 1. Discount System

#### Guest Users
- Cannot apply discount codes
- Clear UI indication of limitation
- Encouragement to sign up/login

#### Authenticated Users
- Full discount functionality
- Persistent discount codes
- Validation against backend API

```typescript
// Conditional discount availability
const { canApplyDiscounts } = UserStateManager.getUserState();

// UI shows appropriate state
{!canApplyDiscounts && (
  <p className="text-gray-500 text-xs">Please log in to apply discount codes</p>
)}
```

### 2. Data Persistence

#### Storage Keys (Centralized)
```typescript
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'authToken',
  USER: 'user',
  CART_ITEMS: 'fresh_county_cart',
  APPLIED_DISCOUNT: 'fresh_county_discount',
  // ... other keys
} as const;
```

#### Cleanup Strategies
- **Logout**: Clear all user-related data
- **Login**: Preserve guest cart, merge if needed
- **Corruption**: Auto-remove invalid data

### 3. UI State Management

#### Loading States
- Show loading indicators during async operations
- Disable inputs during processing
- Clear error states on success

#### Error States
- Display user-friendly error messages
- Provide recovery actions where possible
- Log technical details for debugging

## Security Considerations

### 1. Token Management
- Tokens stored in localStorage (acceptable for this use case)
- Auto-removal on corruption or invalid state
- No sensitive data persisted unnecessarily

### 2. Data Validation
- All data validated on load from storage
- User input sanitized before storage
- Backend validation for critical operations (discounts, orders)

### 3. Privacy
- Complete data clearing on logout
- No cross-user data leakage
- Guest session isolation

## Testing Strategies

### 1. Storage Operations
```typescript
// Test data persistence
const testData = { id: '1', name: 'Test Item' };
SafeStorage.set(STORAGE_KEYS.TEST, testData);
const retrieved = SafeStorage.get(STORAGE_KEYS.TEST);
expect(retrieved).toEqual(testData);
```

### 2. Error Scenarios
- Corrupted localStorage data
- Network failures during API calls
- Race conditions in concurrent operations

### 3. User Flows
- Guest to authenticated user transition
- Logout and data clearing
- Cart persistence across sessions

## Migration Guide

### From Old Pattern
```typescript
// Old: Direct localStorage access
const cart = JSON.parse(localStorage.getItem('cart') || '[]');
localStorage.setItem('cart', JSON.stringify(newCart));
```

### To New Pattern
```typescript
// New: Standardized storage with validation
const cart = ShoppingStateManager.getCartItems();
ShoppingStateManager.saveCartItems(newCart);
```

## Performance Considerations

### 1. Storage Operations
- Minimal localStorage reads/writes
- Batch operations where possible
- Lazy loading of non-critical data

### 2. Event Handling
- Clean up event listeners to prevent memory leaks
- Debounce rapid storage updates
- Validate data before processing events

### 3. Context Re-renders
- Memoize expensive calculations
- Use callbacks to prevent unnecessary re-renders
- Separate concerns between contexts

## Future Enhancements

### 1. Offline Support
- Service worker for cart persistence
- Sync when connection restored
- Conflict resolution strategies

### 2. Analytics Integration
- Track user behavior patterns
- Cart abandonment analysis
- A/B testing framework

### 3. Advanced Features
- Guest cart migration to account
- Multi-device cart sync
- Wishlist functionality

## Conclusion

This standardized approach provides:
- **Consistency**: Unified patterns across the application
- **Reliability**: Error handling and data validation
- **Maintainability**: Clear separation of concerns
- **Scalability**: Foundation for future enhancements
- **User Experience**: Smooth transitions between guest/authenticated states

All new features should follow these established patterns to maintain code quality and user experience consistency.