import { Router } from 'express';
import { TestEmailController } from '../controllers/testEmailController';
import { OrderStatusController } from '../controllers/orderStatusController';

const router = Router();

// Test all email templates
router.post('/test-all', TestEmailController.testAllEmails);

// Test specific email template
router.post('/test-specific', TestEmailController.testSpecificEmail);

// Test email connection
router.get('/test-connection', TestEmailController.testConnection);

// Order status automation endpoints
router.put('/order-status/:orderId', OrderStatusController.updateOrderStatus);
router.post('/order-status/bulk-update', OrderStatusController.bulkUpdateOrderStatus);
router.get('/order-status/:orderId/history', OrderStatusController.getOrderStatusHistory);
router.post('/test-order-automation', OrderStatusController.testOrderStatusAutomation);

export default router;