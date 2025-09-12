import express from 'express';
import { body, param, query } from 'express-validator';
import { authenticate, authorize, optionalAuth } from '../middleware/auth';
import { requirePermission, Permission } from '../middleware/rbac';
import {
  createOrder,
  getUserOrders,
  getOrder,
  cancelOrder,
  updateOrderStatus,
  getAllOrders
} from '../controllers/orderController';

const router = express.Router();

// Session middleware for guest orders
const sessionMiddleware = (req: any, res: any, next: any) => {
  if (!req.user && req.cookies?.guest_session_id) {
    req.session_id = req.cookies.guest_session_id;
  }
  next();
};

router.use(sessionMiddleware);

// Create order - requires authentication
router.post('/', authenticate, [
  body('shipping_address').isObject().withMessage('Shipping address is required'),
  body('shipping_address.first_name').trim().isLength({ min: 2 }).withMessage('First name is required'),
  body('shipping_address.last_name').trim().isLength({ min: 2 }).withMessage('Last name is required'),
  body('shipping_address.phone').trim().isLength({ min: 10 }).withMessage('Valid phone number is required'),
  body('shipping_address.address_line_1').trim().isLength({ min: 5 }).withMessage('Address line 1 is required'),
  body('shipping_address.city').trim().isLength({ min: 2 }).withMessage('City is required'),
  body('shipping_address.state').trim().isLength({ min: 2 }).withMessage('State is required'),
  body('shipping_address.postal_code').optional().trim(),
  body('shipping_address.country').trim().isLength({ min: 2 }).withMessage('Country is required'),
  body('billing_address').optional().isObject(),
  body('payment_method').optional().isIn(['paystack', 'bank_transfer', 'cash_on_delivery']).withMessage('Invalid payment method'),
  body('coupon_code').optional().trim().isLength({ min: 3, max: 50 }),
  body('notes').optional().trim().isLength({ max: 500 }).withMessage('Notes cannot exceed 500 characters')
], createOrder);

// Get user orders
router.get('/', authenticate, [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit must be between 1 and 50'),
  query('status').optional().isIn(['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled']).withMessage('Invalid status'),
  query('sort_by').optional().isIn(['created_at', 'total_amount', 'status']).withMessage('Invalid sort field'),
  query('sort_order').optional().isIn(['ASC', 'DESC']).withMessage('Sort order must be ASC or DESC')
], getUserOrders);

// Get order by ID
router.get('/:id', authenticate, [
  param('id').isUUID().withMessage('Order ID must be a valid UUID')
], getOrder);

// Cancel order
router.post('/:id/cancel', authenticate, [
  param('id').isUUID().withMessage('Order ID must be a valid UUID'),
  body('reason').optional().trim().isLength({ max: 255 }).withMessage('Reason cannot exceed 255 characters')
], cancelOrder);

// Update order status (admin/manager/staff)
router.put('/:id/status', authenticate, requirePermission(Permission.UPDATE_ORDER_STATUS), [
  param('id').isUUID().withMessage('Order ID must be a valid UUID'),
  body('status').isIn(['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled']).withMessage('Invalid status'),
  body('notes').optional().trim().isLength({ max: 500 }).withMessage('Notes cannot exceed 500 characters'),
  body('tracking_number').optional().trim().isLength({ min: 3, max: 100 }).withMessage('Invalid tracking number')
], updateOrderStatus);

// Get all orders (admin/manager/staff)
router.get('/admin/orders', authenticate, requirePermission(Permission.VIEW_ORDERS), [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('status').optional().isIn(['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled']).withMessage('Invalid status'),
  query('payment_status').optional().isIn(['pending', 'paid', 'failed', 'refunded']).withMessage('Invalid payment status'),
  query('sort_by').optional().isIn(['created_at', 'total_amount', 'status']).withMessage('Invalid sort field'),
  query('sort_order').optional().isIn(['ASC', 'DESC']).withMessage('Sort order must be ASC or DESC'),
  query('search').optional().trim().isLength({ max: 100 }).withMessage('Search term cannot exceed 100 characters')
], getAllOrders);

// Paystack webhook
router.post('/webhook/paystack', async (req: express.Request, res: express.Response) => {
  // TODO: Implement Paystack webhook controller
  res.json({ message: 'Paystack webhook endpoint - to be implemented' });
});

export default router;