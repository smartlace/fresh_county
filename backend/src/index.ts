import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import path from 'path';
import cookieParser from 'cookie-parser';
import { connectDatabase } from './config/database';
import { connectRedis } from './config/redis';
import { errorHandler } from './middleware/errorHandler';
import { adminLimiter, adminDashboardLimiter, uploadLimiter, newsletterLimiter, contactLimiter } from './middleware/rateLimiter';
import { requireAdminAuth, requireAdminAuthAPI } from './middleware/adminAuth';
import { Permission, requirePermission } from './middleware/rbac';

// Routes
import authRoutes from './routes/auth';
import userRoutes from './routes/users';
import productRoutes from './routes/products';
import cartRoutes from './routes/cart';
import orderRoutes from './routes/orders';
import adminRoutes from './routes/admin';
import uploadRoutes from './routes/upload';
import couponRoutes from './routes/coupon';
import publicCouponRoutes from './routes/publicCoupon';
import newsletterRoutes from './routes/newsletter';
import websitePagesRoutes from './routes/websitePages';
import blogRoutes from './routes/blog';
import testEmailRoutes from './routes/testEmail';
import publicSettingsRoutes from './routes/publicSettings';
import productVariationRoutes from './routes/productVariations';
import shippingZonesRoutes from './routes/shippingZones';
import publicShippingZonesRoutes from './routes/publicShippingZones';
import settingsPublicRoutes from './routes/settingsPublic';
import contactRoutes from './routes/contact';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Trust proxy for shared hosting environments (Namecheap, etc.)
// Use 1 to trust the first proxy (load balancer/reverse proxy)
app.set('trust proxy', 1);

// Middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "blob:", process.env.BACKEND_URL || "http://localhost:3001", process.env.FRONTEND_URL || "http://localhost:3000"], // Allow images from backend server and frontend domain
      styleSrc: ["'self'", "https:", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: [],
    },
  },
}));
app.use(cors({
  origin: [
    process.env.FRONTEND_URL || 'http://localhost:3000',
    process.env.ADMIN_URL || 'http://localhost:3002'
  ],
  credentials: true
}));
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
// Note: Rate limiting is now applied selectively to specific routes only

// Static file serving for uploads - use same path as upload middleware
const uploadsPath = process.env.UPLOAD_PATH || path.join(__dirname, '../uploads');
app.use('/uploads', express.static(uploadsPath));

// Health check
app.get('/health', (req: express.Request, res: express.Response) => {
  res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
// Admin dashboard routes (lenient rate limiting for frequent polling)
app.use('/api/admin/settings', adminDashboardLimiter, requireAdminAuthAPI, adminRoutes);
app.use('/api/admin/dashboard', adminDashboardLimiter, requireAdminAuthAPI, adminRoutes);
app.use('/api/admin/analytics', adminDashboardLimiter, requireAdminAuthAPI, adminRoutes);
app.use('/api/admin/orders/stats', adminDashboardLimiter, requireAdminAuthAPI, adminRoutes);
app.use('/api/admin/users/stats', adminDashboardLimiter, requireAdminAuthAPI, adminRoutes);
// All other admin routes (standard rate limiting)
app.use('/api/admin', adminLimiter, requireAdminAuthAPI, adminRoutes);
app.use('/api/upload', uploadLimiter, uploadRoutes);
// Public coupon validation (requires user auth, not admin)
app.use('/api/coupon', publicCouponRoutes);
// Public settings (bank details for payment modal - no auth required)
app.use('/api/settings', publicSettingsRoutes);
// Public settings for under construction check (no auth required)
app.use('/api/settings/public', settingsPublicRoutes);
// Public newsletter subscription (no auth required)
app.use('/api/newsletter', newsletterLimiter, newsletterRoutes);
// Public FAQ endpoint (no auth required)
app.use('/api/faqs', websitePagesRoutes);
// Public website pages (no auth required for public endpoints)
app.use('/api/website-pages', websitePagesRoutes);
// Public blog endpoints (no auth required for public endpoints)
app.use('/api/blog', blogRoutes);
// Admin coupon management 
app.use('/api/coupons', requireAdminAuthAPI, couponRoutes);
app.use('/api/newsletters', requireAdminAuthAPI, newsletterRoutes);
app.use('/api/admin/website-pages', requireAdminAuthAPI, websitePagesRoutes);
app.use('/api/admin/blog', requireAdminAuthAPI, blogRoutes);
app.use('/api/product-variations', requireAdminAuthAPI, productVariationRoutes);
// Shipping zones routes
app.use('/api/shipping-zones', publicShippingZonesRoutes); // Public route for frontend
app.use('/api/admin/shipping-zones', requirePermission(Permission.VIEW_SHIPPING_ZONES), shippingZonesRoutes); // Manager/Admin routes
// Contact form routes (no auth required)
app.use('/api/contact', contactLimiter, contactRoutes);
app.use('/api/test-email', testEmailRoutes);

// Legacy HTML admin routes removed - now using React admin at port 3002

// Test route
app.get('/api/test', (req: express.Request, res: express.Response) => {
  res.json({ message: 'API is working!' });
});




// Error handling
app.use(errorHandler);

// 404 handler
app.use('*', (req: express.Request, res: express.Response) => {
  res.status(404).json({ message: 'Route not found' });
});

// Start server
const startServer = async () => {
  try {
    await connectDatabase();
    const redisConnected = await connectRedis();
    
    if (!redisConnected) {
      console.warn('Server starting without Redis - some caching features may be limited');
    }
    
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`Health check: http://localhost:${PORT}/health`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();