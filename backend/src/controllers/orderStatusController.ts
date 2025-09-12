import { Request, Response } from 'express';
import { OrderStatusService, OrderStatusUpdate } from '../services/orderStatusService';

export class OrderStatusController {

  /**
   * Update order status with automatic notifications
   */
  static async updateOrderStatus(req: Request, res: Response) {
    try {
      const { orderId } = req.params;
      const { 
        newStatus, 
        notes, 
        trackingNumber, 
        notifyCustomer = true, 
        notifyAdmin = true 
      } = req.body;

      const update: OrderStatusUpdate = {
        orderId: orderId.toString(),
        newStatus,
        notes,
        trackingNumber,
        updatedBy: (req.user?.user_id || 'system').toString(),
        notifyCustomer,
        notifyAdmin
      };

      await OrderStatusService.updateOrderStatus(update);

      res.json({
        success: true,
        message: 'Order status updated successfully with notifications sent'
      });

    } catch (error) {
      console.error('Order status update failed:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update order status',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Bulk update order statuses
   */
  static async bulkUpdateOrderStatus(req: Request, res: Response) {
    try {
      const { updates } = req.body;
      
      if (!Array.isArray(updates) || updates.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Updates array is required'
        });
      }

      // Add updatedBy to each update
      const processedUpdates: OrderStatusUpdate[] = updates.map(update => ({
        ...update,
        updatedBy: (req.user?.user_id || 'system').toString()
      }));

      const successCount = await OrderStatusService.bulkUpdateOrderStatus(processedUpdates);

      res.json({
        success: true,
        message: `Successfully updated ${successCount}/${updates.length} orders`,
        successCount,
        totalCount: updates.length
      });

    } catch (error) {
      console.error('Bulk order status update failed:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to bulk update order statuses',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Get order status history
   */
  static async getOrderStatusHistory(req: Request, res: Response) {
    try {
      const { orderId } = req.params;
      
      const history = await OrderStatusService.getOrderStatusHistory(orderId);

      res.json({
        success: true,
        data: history
      });

    } catch (error) {
      console.error('Failed to get order status history:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get order status history',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Test order status automation with sample data
   */
  static async testOrderStatusAutomation(req: Request, res: Response) {
    try {
      const { orderId, email = 'test@freshcounty.com' } = req.body;

      // Create test order if orderId not provided
      let testOrderId = orderId;
      
      if (!testOrderId) {
        // You would typically get this from an existing order
        // For demo, we'll use a placeholder
        testOrderId = 'test-order-' + Date.now();
        
        return res.status(400).json({
          success: false,
          message: 'Please provide an existing orderId to test status automation'
        });
      }

      // Test different status updates
      const statusSequence = ['confirmed', 'processing', 'shipped', 'delivered'];
      const results = [];

      for (const [index, status] of statusSequence.entries()) {
        const update: OrderStatusUpdate = {
          orderId: testOrderId,
          newStatus: status as any,
          notes: `Test status update to ${status}`,
          trackingNumber: status === 'shipped' ? 'FC-TEST-' + Date.now() : undefined,
          updatedBy: 'test-system',
          notifyCustomer: true,
          notifyAdmin: index === 0 // Only notify admin for first status (new order)
        };

        try {
          await OrderStatusService.updateOrderStatus(update);
          results.push({ status, success: true });
        } catch (error) {
          results.push({ 
            status, 
            success: false, 
            error: error instanceof Error ? error.message : 'Unknown error'
          });
        }

        // Small delay between updates
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      res.json({
        success: true,
        message: 'Order status automation test completed',
        orderId: testOrderId,
        results
      });

    } catch (error) {
      console.error('Order status automation test failed:', error);
      res.status(500).json({
        success: false,
        message: 'Order status automation test failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
}