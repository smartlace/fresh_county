// Environment configuration for Fresh County Admin React

export const env = {
  // API Configuration  
  API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',
  API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001/api',
  
  // Application Configuration
  APP_NAME: process.env.NEXT_PUBLIC_APP_NAME || 'Fresh County Admin',
  APP_VERSION: process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0',
  APP_DESCRIPTION: process.env.NEXT_PUBLIC_APP_DESCRIPTION || 'Secure admin panel for Fresh County e-commerce platform',
  
  // Environment
  NODE_ENV: process.env.NODE_ENV || 'development',
  ENV: process.env.NEXT_PUBLIC_ENV || 'development',
  IS_DEVELOPMENT: process.env.NODE_ENV === 'development',
  IS_PRODUCTION: process.env.NODE_ENV === 'production',
  
  // Security Configuration
  SESSION_TIMEOUT: parseInt(process.env.NEXT_PUBLIC_SESSION_TIMEOUT || '3600000'), // 1 hour
  TOKEN_REFRESH_INTERVAL: parseInt(process.env.NEXT_PUBLIC_TOKEN_REFRESH_INTERVAL || '900000'), // 15 minutes
  
  // MFA Configuration
  MFA: {
    ISSUER: process.env.NEXT_PUBLIC_MFA_ISSUER || 'Fresh County',
    DIGITS: parseInt(process.env.NEXT_PUBLIC_MFA_DIGITS || '6'),
    PERIOD: parseInt(process.env.NEXT_PUBLIC_MFA_PERIOD || '30'),
  },
  
  // UI Configuration
  UI: {
    PAGINATION_LIMIT: parseInt(process.env.NEXT_PUBLIC_PAGINATION_LIMIT || '20'),
    MAX_FILE_SIZE: parseInt(process.env.NEXT_PUBLIC_MAX_FILE_SIZE || '5242880'), // 5MB
    ALLOWED_IMAGE_TYPES: (process.env.NEXT_PUBLIC_ALLOWED_IMAGE_TYPES || 'image/jpeg,image/png,image/webp').split(','),
  },
  
  // Chart Configuration
  CHART: {
    ANIMATION: process.env.NEXT_PUBLIC_CHART_ANIMATION === 'true',
    RESPONSIVE: process.env.NEXT_PUBLIC_CHART_RESPONSIVE === 'true',
  },
  
  // Toast Configuration
  TOAST: {
    DURATION: parseInt(process.env.NEXT_PUBLIC_TOAST_DURATION || '4000'),
    POSITION: process.env.NEXT_PUBLIC_TOAST_POSITION || 'top-right',
  },
  
  // Debug Configuration
  DEBUG: {
    MODE: process.env.NEXT_PUBLIC_DEBUG_MODE === 'true',
    CONSOLE_LOGS: process.env.NEXT_PUBLIC_ENABLE_CONSOLE_LOGS === 'true',
  },
  
  // Performance Configuration
  PERFORMANCE: {
    ENABLE_SW: process.env.NEXT_PUBLIC_ENABLE_SW === 'true',
    CACHE_STATIC_ASSETS: process.env.NEXT_PUBLIC_CACHE_STATIC_ASSETS === 'true',
  },
} as const;

// Type-safe environment validation
export const validateEnv = () => {
  const requiredVars = [
    'NEXT_PUBLIC_API_URL',
    'NEXT_PUBLIC_APP_NAME',
  ];
  
  const missingVars = requiredVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
  }
  
  // Validate API URL format
  try {
    new URL(env.API_URL);
  } catch {
    throw new Error(`Invalid API_URL format: ${env.API_URL}`);
  }
  
  return true;
};

// Development helper to log configuration
export const logEnvConfig = () => {
  if (env.DEBUG.CONSOLE_LOGS && env.IS_DEVELOPMENT) {
    console.group('🔧 Fresh County Admin Configuration');
    console.log('Environment:', env.ENV);
    console.log('API URL:', env.API_URL);
    console.log('App Name:', env.APP_NAME);
    console.log('Version:', env.APP_VERSION);
    console.log('Debug Mode:', env.DEBUG.MODE);
    console.groupEnd();
  }
};

export default env;