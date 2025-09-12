import { Request, Response } from 'express';
import { emailService, OrderEmailData, UserEmailData, AdminNotificationData, PasswordResetSuccessData } from '../services/emailService';

// Test email controller for demonstrating all email templates
export class TestEmailController {
  
  // Test all email templates
  static async testAllEmails(req: Request, res: Response) {
    try {
      const testEmail = req.body.email || 'test@example.com';
      const results = [];

      // Test Welcome Email
      const userData: UserEmailData = {
        firstName: 'John',
        lastName: 'Doe', 
        email: testEmail
      };
      
      const welcomeResult = await emailService.sendWelcomeEmail(testEmail, userData);
      results.push({ type: 'welcome', success: welcomeResult });

      // Test Order Confirmation Email
      const orderData: OrderEmailData = {
        customerName: 'John Doe',
        orderNumber: 'FC' + Date.now().toString().slice(-8),
        orderDate: new Date().toLocaleDateString(),
        orderTotal: '₦15,450.00',
        orderStatus: 'Confirmed',
        items: [
          {
            name: 'Fresh Organic Tomatoes',
            quantity: 2,
            price: '₦3,500.00',
            total: '₦7,000.00',
            image: '/uploads/products/tomato.jpg'
          },
          {
            name: 'Organic Spinach Bundle',
            quantity: 1,
            price: '₦4,200.00',
            total: '₦4,200.00'
          },
          {
            name: 'Free-Range Eggs (12 pack)',
            quantity: 1,
            price: '₦2,800.00',
            total: '₦2,800.00'
          }
        ],
        shippingAddress: {
          name: 'John Doe',
          street: '123 Main Street',
          city: 'Lagos',
          state: 'Lagos State',
          country: 'Nigeria',
          zipCode: '100001'
        },
        subtotal: '₦14,000.00',
        taxAmount: '₦1,050.00',
        shippingCost: '₦400.00',
        discount: '₦0.00'
      };

      const orderConfirmationResult = await emailService.sendOrderConfirmation(testEmail, orderData);
      results.push({ type: 'order-confirmation', success: orderConfirmationResult });

      // Note: Order Shipped emails are disabled to reduce customer email fatigue
      // Status updates are for display only, no email notification sent

      // Test Order Delivered Email
      const deliveredOrderData = {
        ...orderData,
        orderStatus: 'Delivered',
        trackingNumber: 'FCN123456789'
      };

      const orderDeliveredResult = await emailService.sendOrderStatusUpdate(testEmail, deliveredOrderData);
      results.push({ type: 'order-delivered', success: orderDeliveredResult });

      // Test Order Cancelled Email
      const cancelledOrderData = {
        ...orderData,
        orderStatus: 'Cancelled'
      };

      const orderCancelledResult = await emailService.sendOrderStatusUpdate(testEmail, cancelledOrderData);
      results.push({ type: 'order-cancelled', success: orderCancelledResult });

      // Test Admin Notification Email
      const adminNotification: AdminNotificationData = {
        type: 'new_order',
        title: 'New Order Received',
        message: `New order #FC${Date.now().toString().slice(-8)} received from John Doe. Total: ₦15,450. Payment pending - requires attention.`,
        data: {
          orderNumber: 'FC' + Date.now().toString().slice(-8),
          customerName: 'John Doe',
          customerEmail: testEmail,
          amount: '₦15,450.00',
          status: 'pending',
          paymentStatus: 'pending'
        },
        timestamp: new Date().toISOString()
      };

      const adminNotificationResult = await emailService.sendAdminNotification(adminNotification);
      results.push({ type: 'admin-notification', success: adminNotificationResult });

      // Test Password Reset Email
      const resetUserData: UserEmailData = {
        firstName: 'John',
        lastName: 'Doe',
        email: testEmail,
        resetToken: 'test-reset-token-123'
      };

      const passwordResetResult = await emailService.sendPasswordResetEmail(testEmail, resetUserData);
      results.push({ type: 'password-reset', success: passwordResetResult });

      // Test Password Reset Success Email
      const resetSuccessData: PasswordResetSuccessData = {
        firstName: 'John',
        lastName: 'Doe',
        email: testEmail,
        changeDate: new Date().toLocaleDateString('en-US', { 
          weekday: 'long', 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        }),
        changeTime: new Date().toLocaleTimeString('en-US', { 
          hour: '2-digit', 
          minute: '2-digit',
          second: '2-digit',
          timeZoneName: 'short'
        }),
        ipAddress: '192.168.1.100',
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
      };

      const passwordResetSuccessResult = await emailService.sendPasswordResetSuccessEmail(testEmail, resetSuccessData);
      results.push({ type: 'password-reset-success', success: passwordResetSuccessResult });

      const successCount = results.filter(r => r.success).length;
      
      res.json({
        success: true,
        message: `Email test completed. ${successCount}/${results.length} emails sent successfully.`,
        results,
        testEmail
      });

    } catch (error) {
      console.error('Email test failed:', error);
      res.status(500).json({
        success: false,
        message: 'Email test failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // Test specific email template
  static async testSpecificEmail(req: Request, res: Response) {
    try {
      const { type, email = 'test@example.com' } = req.body;
      let result = false;

      switch (type) {
        case 'welcome':
          const userData: UserEmailData = {
            firstName: 'John',
            lastName: 'Doe',
            email
          };
          result = await emailService.sendWelcomeEmail(email, userData);
          break;

        case 'order-confirmation':
          const orderData: OrderEmailData = {
            customerName: 'John Doe',
            orderNumber: 'FC' + Date.now().toString().slice(-8),
            orderDate: new Date().toLocaleDateString(),
            orderTotal: '₦8,500.00',
            orderStatus: 'Confirmed',
            items: [
              {
                name: 'Test Product',
                quantity: 1,
                price: '₦7,500.00',
                total: '₦7,500.00'
              }
            ],
            shippingAddress: {
              name: 'John Doe',
              street: '123 Test Street',
              city: 'Lagos',
              state: 'Lagos State',
              country: 'Nigeria',
              zipCode: '100001'
            },
            subtotal: '₦7,500.00',
            taxAmount: '₦562.50',
            shippingCost: '₦437.50'
          };
          result = await emailService.sendOrderConfirmation(email, orderData);
          break;

        case 'admin-notification':
          const adminData: AdminNotificationData = {
            type: 'low_stock',
            title: 'Low Stock Alert',
            message: 'Product running low on inventory.',
            data: {
              productName: 'Test Product',
              stockLevel: 5,
              threshold: 10
            },
            timestamp: new Date().toISOString()
          };
          result = await emailService.sendAdminNotification(adminData);
          break;

        default:
          return res.status(400).json({
            success: false,
            message: 'Invalid email type. Supported types: welcome, order-confirmation, admin-notification'
          });
      }

      res.json({
        success: result,
        message: result ? `${type} email sent successfully` : `Failed to send ${type} email`,
        type,
        email
      });

    } catch (error) {
      console.error('Specific email test failed:', error);
      res.status(500).json({
        success: false,
        message: 'Email test failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // Test email connection
  static async testConnection(req: Request, res: Response) {
    try {
      const result = await emailService.testConnection();
      
      res.json({
        success: result,
        message: result ? 'Email connection successful' : 'Email connection failed'
      });
    } catch (error) {
      console.error('Email connection test failed:', error);
      res.status(500).json({
        success: false,
        message: 'Email connection test failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
}