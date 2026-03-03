/**
 * Standardized localStorage utility for Fresh County
 * Handles all data persistence with consistent error handling and naming
 */

import { logError, logWarn } from './logger'
import type { User } from './types'

// Storage keys - centralized to prevent typos and ensure consistency
export const STORAGE_KEYS = {
  // Authentication
  AUTH_TOKEN: 'authToken',
  REFRESH_TOKEN: 'refreshToken',
  USER: 'user',
  
  // Cart & Shopping
  CART_ITEMS: 'fresh_county_cart',
  DELIVERY_TYPE: 'fresh_county_delivery',
  APPLIED_DISCOUNT: 'fresh_county_discount',
  
  // Checkout
  CHECKOUT_DELIVERY_INFO: 'checkoutDeliveryInfo',
} as const;

export type StorageKey = typeof STORAGE_KEYS[keyof typeof STORAGE_KEYS];

/**
 * Safe localStorage operations with error handling
 */
export class SafeStorage {
  /**
   * Get item from localStorage with type safety and error handling
   */
  static get<T>(key: StorageKey, defaultValue: T | null = null): T | null {
    try {
      if (typeof window === 'undefined') return defaultValue;
      
      const item = localStorage.getItem(key);
      if (item === null) return defaultValue;
      
      return JSON.parse(item);
    } catch (error) {
      logError(`Error reading from localStorage (${key})`, error, {
        component: 'storage',
        action: 'get'
      });
      // Clean up corrupted data
      SafeStorage.remove(key);
      return defaultValue;
    }
  }

  /**
   * Set item to localStorage with error handling
   */
  static set<T>(key: StorageKey, value: T): boolean {
    try {
      if (typeof window === 'undefined') return false;
      
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      logError(`Error writing to localStorage (${key})`, error, {
        component: 'storage',
        action: 'set'
      });
      return false;
    }
  }

  /**
   * Remove item from localStorage
   */
  static remove(key: StorageKey): void {
    try {
      if (typeof window === 'undefined') return;
      localStorage.removeItem(key);
    } catch (error) {
      logError(`Error removing from localStorage (${key})`, error, {
        component: 'storage',
        action: 'remove'
      });
    }
  }

  /**
   * Clear all app-related storage
   */
  static clearAll(): void {
    Object.values(STORAGE_KEYS).forEach(key => {
      SafeStorage.remove(key);
    });
  }

  /**
   * Clear only authentication-related storage
   */
  static clearAuth(): void {
    SafeStorage.remove(STORAGE_KEYS.AUTH_TOKEN);
    SafeStorage.remove(STORAGE_KEYS.REFRESH_TOKEN);
    SafeStorage.remove(STORAGE_KEYS.USER);
  }

  /**
   * Clear only shopping-related storage (cart, discounts, etc.)
   */
  static clearShopping(): void {
    SafeStorage.remove(STORAGE_KEYS.CART_ITEMS);
    SafeStorage.remove(STORAGE_KEYS.DELIVERY_TYPE);
    SafeStorage.remove(STORAGE_KEYS.APPLIED_DISCOUNT);
    SafeStorage.remove(STORAGE_KEYS.CHECKOUT_DELIVERY_INFO);
  }
}

/**
 * User state management utilities
 */
export class UserStateManager {
  /**
   * Check if user is authenticated (has valid token and user data)
   */
  static isAuthenticated(): boolean {
    const token = SafeStorage.get<string>(STORAGE_KEYS.AUTH_TOKEN);
    const user = SafeStorage.get<User>(STORAGE_KEYS.USER);
    return !!(token && user);
  }

  /**
   * Get current user data
   */
  static getCurrentUser(): User | null {
    return SafeStorage.get<User>(STORAGE_KEYS.USER);
  }

  /**
   * Handle logout - clear auth data and shopping data
   */
  static handleLogout(clearShoppingData: boolean = true): void {
    SafeStorage.clearAuth();
    
    if (clearShoppingData) {
      SafeStorage.clearShopping();
      // Dispatch logout event for other contexts
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('userLogout'));
      }
    }
  }

  /**
   * Handle login - store user data
   */
  static handleLogin(token: string, refreshToken: string, user: User): void {
    SafeStorage.set(STORAGE_KEYS.AUTH_TOKEN, token);
    SafeStorage.set(STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
    SafeStorage.set(STORAGE_KEYS.USER, user);

    // Dispatch login event for other contexts
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('userLogin', { detail: { user } }));
    }
  }

  /**
   * Get user state information
   */
  static getUserState(): { 
    isAuthenticated: boolean; 
    user: User | null; 
    canApplyDiscounts: boolean;
  } {
    const isAuthenticated = UserStateManager.isAuthenticated();
    const user = isAuthenticated ? UserStateManager.getCurrentUser() : null;
    const canApplyDiscounts = isAuthenticated; // Only authenticated users can apply discounts
    
    return {
      isAuthenticated,
      user,
      canApplyDiscounts
    };
  }
}

/**
 * Shopping cart utilities
 */
export interface CartItem {
  id: string;
  name: string;
  price: number;
  image: string;
  description: string;
  size: string;
  quantity: number;
  category: string;
  // For variable products - store base product ID for backend order processing
  product_id?: string;
  variation_id?: string | null;
}

export interface DiscountInfo {
  code: string;
  name: string;
  type: 'percentage' | 'fixed_amount';
  discount_value: number;
  discount_amount: number;
}

export class ShoppingStateManager {
  /**
   * Migrate legacy cart items to new structure
   */
  static migrateLegacyCartItems(items: unknown[]): CartItem[] {
    return items.map(item => {
      const cartItem = item as Record<string, unknown>;
      
      // If item already has product_id, it's already migrated
      if (cartItem.product_id && 
          typeof cartItem.id === 'string' &&
          typeof cartItem.name === 'string' &&
          typeof cartItem.price === 'number' &&
          typeof cartItem.image === 'string' &&
          typeof cartItem.description === 'string' &&
          typeof cartItem.size === 'string' &&
          typeof cartItem.quantity === 'number' &&
          typeof cartItem.category === 'string') {
        return cartItem as unknown as CartItem;
      }
      
      // For legacy items, assume id is the product_id for regular products
      // Variable products will need to be re-added to cart
      return {
        ...cartItem,
        product_id: cartItem.id, // For regular products, id = product_id
        variation_id: null   // Legacy items are regular products
      } as CartItem;
    });
  }

  /**
   * Get cart items with validation and fallback
   */
  static getCartItems(): CartItem[] {
    const rawItems = SafeStorage.get<unknown[]>(STORAGE_KEYS.CART_ITEMS, []) || [];
    
    // Migrate legacy items
    const migratedItems = ShoppingStateManager.migrateLegacyCartItems(rawItems);
    
    // Validate cart items structure - check all required fields
    const validItems = migratedItems.filter(item => 
      item && 
      typeof item === 'object' &&
      typeof item.id === 'string' &&
      typeof item.name === 'string' &&
      typeof item.price === 'number' &&
      typeof item.image === 'string' &&
      typeof item.description === 'string' &&
      typeof item.size === 'string' &&
      typeof item.quantity === 'number' &&
      typeof item.category === 'string' &&
      // Optional fields for variable products
      (item.product_id === undefined || typeof item.product_id === 'string') &&
      (item.variation_id === undefined || item.variation_id === null || typeof item.variation_id === 'string') &&
      item.quantity > 0 &&
      item.id.length > 0 &&
      item.name.length > 0 &&
      item.size.length > 0
    );
    
    // Save migrated items back to storage if migration occurred
    if (rawItems.length > 0 && JSON.stringify(rawItems) !== JSON.stringify(validItems)) {
      logWarn('Migrating cart items to new structure', {
        component: 'storage',
        action: 'migrate_cart',
        metadata: { 
          oldCount: rawItems.length, 
          newCount: validItems.length 
        }
      });
      ShoppingStateManager.saveCartItems(validItems);
    }
    
    return validItems;
  }

  /**
   * Save cart items
   */
  static saveCartItems(items: CartItem[]): void {
    SafeStorage.set(STORAGE_KEYS.CART_ITEMS, items);
  }

  /**
   * Get delivery type with fallback
   */
  static getDeliveryType(): string {
    return SafeStorage.get<string>(STORAGE_KEYS.DELIVERY_TYPE, 'pickup') || 'pickup';
  }

  /**
   * Save delivery type
   */
  static saveDeliveryType(type: string): void {
    SafeStorage.set(STORAGE_KEYS.DELIVERY_TYPE, type);
  }

  /**
   * Get applied discount with validation
   */
  static getAppliedDiscount(): DiscountInfo | null {
    const discount = SafeStorage.get<DiscountInfo>(STORAGE_KEYS.APPLIED_DISCOUNT);
    
    // Validate discount structure
    if (discount && 
        typeof discount === 'object' &&
        typeof discount.code === 'string' &&
        typeof discount.name === 'string' &&
        typeof discount.discount_amount === 'number' &&
        discount.discount_amount > 0) {
      return discount;
    }
    
    // Clear invalid discount
    if (discount) {
      SafeStorage.remove(STORAGE_KEYS.APPLIED_DISCOUNT);
    }
    
    return null;
  }

  /**
   * Save applied discount
   */
  static saveAppliedDiscount(discount: DiscountInfo): void {
    SafeStorage.set(STORAGE_KEYS.APPLIED_DISCOUNT, discount);
  }

  /**
   * Clear applied discount
   */
  static clearAppliedDiscount(): void {
    SafeStorage.remove(STORAGE_KEYS.APPLIED_DISCOUNT);
  }

  /**
   * Clear all shopping data
   */
  static clearAll(): void {
    SafeStorage.clearShopping();
  }
}