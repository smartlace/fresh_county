import pool from '../config/database';
import { emailService, OrderEmailData, AdminNotificationData } from './emailService';

export interface OrderStatusUpdate {
  orderId: string;
  newStatus: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  notes?: string;
  trackingNumber?: string;
  updatedBy: string;
  notifyCustomer?: boolean;
  notifyAdmin?: boolean;
}

export class OrderStatusService {

  /**
   * Update order status with automatic email notifications
   */
  static async updateOrderStatus(update: OrderStatusUpdate): Promise<boolean> {
    const connection = await pool.getConnection();
    
    try {
      await connection.beginTransaction();

      // Get current order details
      const [orders] = await connection.execute(`
        SELECT 
          o.*, 
          u.first_name,
          u.last_name,
          u.email as user_email
        FROM orders o
        LEFT JOIN users u ON o.user_id = u.id
        WHERE o.id = ?
      `, [update.orderId]);

      if (!Array.isArray(orders) || orders.length === 0) {
        throw new Error('Order not found');
      }

      const order = orders[0] as any;
      const previousStatus = order.order_status;

      // Update order status
      await connection.execute(`
        UPDATE orders 
        SET order_status = ?, 
            tracking_number = ?, 
            updated_at = NOW()
        WHERE id = ?
      `, [update.newStatus, update.trackingNumber || null, update.orderId]);

      // Add to status history
      await connection.execute(`
        INSERT INTO order_status_history (order_id, status, notes, changed_by, created_at)
        VALUES (?, ?, ?, ?, NOW())
      `, [update.orderId, update.newStatus, update.notes || null, update.updatedBy]);

      await connection.commit();

      // Send notifications based on status and preferences
      if (update.notifyCustomer !== false) {
        await this.sendCustomerNotification(order, update);
      }

      if (update.notifyAdmin !== false) {
        await this.sendAdminNotification(order, update, previousStatus);
      }

      // Handle special status-specific actions
      await this.handleStatusSpecificActions(order, update);

      console.log(`✅ Order ${order.order_number} status updated to ${update.newStatus}`);
      return true;

    } catch (error) {
      await connection.rollback();
      console.error('❌ Failed to update order status:', error);
      throw error;
    } finally {
      connection.release();
    }
  }

  /**
   * Send customer notification email
   */
  private static async sendCustomerNotification(order: any, update: OrderStatusUpdate) {
    if (!order.user_email || !['confirmed', 'shipped', 'delivered', 'cancelled'].includes(update.newStatus)) {
      return;
    }

    try {
      // Get order items for email
      const [orderItems] = await pool.execute(`
        SELECT 
          oi.*,
          p.name,
          p.image_url
        FROM order_items oi
        JOIN products p ON oi.product_id = p.id
        WHERE oi.order_id = ?
      `, [order.id]);

      const emailData: OrderEmailData = {
        customerName: `${order.first_name} ${order.last_name}`.trim(),
        orderNumber: order.order_number,
        orderDate: new Date(order.created_at).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long', 
          day: 'numeric'
        }),
        orderTotal: `₦${parseFloat(order.total_amount).toLocaleString()}`,
        orderStatus: this.getStatusDisplayName(update.newStatus),
        items: (orderItems as any[]).map(item => ({
          name: item.name,
          quantity: item.quantity,
          price: `₦${parseFloat(item.unit_price).toLocaleString()}`,
          total: `₦${(parseFloat(item.unit_price) * item.quantity).toLocaleString()}`,
          image: item.image_url
        })),
        shippingAddress: {
          name: order.shipping_name || `${order.first_name} ${order.last_name}`,
          street: order.shipping_address || order.address || '',
          city: order.shipping_city || order.city || '',
          state: order.shipping_state || order.state || '',
          country: order.shipping_country || 'Nigeria',
          zipCode: order.shipping_zip || order.zip_code || ''
        },
        subtotal: `₦${parseFloat(order.subtotal || order.total_amount).toLocaleString()}`,
        taxAmount: `₦${parseFloat(order.tax_amount || '0').toLocaleString()}`,
        shippingCost: `₦${parseFloat(order.shipping_cost || '0').toLocaleString()}`,
        discount: order.discount_amount ? `₦${parseFloat(order.discount_amount).toLocaleString()}` : undefined,
        trackingNumber: update.trackingNumber,
        estimatedDelivery: update.newStatus === 'shipped' ? 
          new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          }) : undefined
      };

      // Send appropriate email based on status
      if (update.newStatus === 'confirmed') {
        await emailService.sendOrderConfirmation(order.user_email, emailData);
      } else {
        await emailService.sendOrderStatusUpdate(order.user_email, emailData);
      }

      console.log(`✅ Customer notification sent for order ${order.order_number} (${update.newStatus})`);

    } catch (error) {
      console.error(`❌ Failed to send customer notification for order ${order.order_number}:`, error);
    }
  }

  /**
   * Send admin notification for important status changes
   */
  private static async sendAdminNotification(order: any, update: OrderStatusUpdate, previousStatus: string) {
    // Only send admin notifications for critical status changes
    const criticalStatuses = ['cancelled', 'delivered'];
    const newOrders = update.newStatus === 'confirmed' && previousStatus !== 'confirmed';

    if (!criticalStatuses.includes(update.newStatus) && !newOrders) {
      return;
    }

    try {
      const adminNotification: AdminNotificationData = {
        type: newOrders ? 'new_order' : 'user_registration', // Use closest match
        title: this.getAdminNotificationTitle(update.newStatus, newOrders),
        message: this.getAdminNotificationMessage(order, update, previousStatus),
        data: {
          orderNumber: order.order_number,
          customerEmail: order.user_email,
          amount: `₦${parseFloat(order.total_amount).toLocaleString()}`,
          status: update.newStatus,
          previousStatus,
          notes: update.notes
        },
        timestamp: new Date().toISOString()
      };

      await emailService.sendAdminNotification(adminNotification);
      console.log(`✅ Admin notification sent for order ${order.order_number} (${update.newStatus})`);

    } catch (error) {
      console.error(`❌ Failed to send admin notification for order ${order.order_number}:`, error);
    }
  }

  /**
   * Handle status-specific actions (inventory, payments, etc.)
   */
  private static async handleStatusSpecificActions(order: any, update: OrderStatusUpdate) {
    switch (update.newStatus) {
      case 'cancelled':
        await this.restoreInventory(order.id);
        break;
      
      case 'delivered':
        await this.markPaymentComplete(order.id);
        break;
    }
  }

  /**
   * Restore inventory when order is cancelled
   */
  private static async restoreInventory(orderId: string) {
    try {
      await pool.execute(`
        UPDATE products p
        JOIN order_items oi ON p.id = oi.product_id
        SET p.stock_quantity = p.stock_quantity + oi.quantity
        WHERE oi.order_id = ?
      `, [orderId]);

      console.log(`✅ Inventory restored for cancelled order ${orderId}`);
    } catch (error) {
      console.error(`❌ Failed to restore inventory for order ${orderId}:`, error);
    }
  }

  /**
   * Mark payment as complete when order is delivered
   */
  private static async markPaymentComplete(orderId: string) {
    try {
      await pool.execute(`
        UPDATE orders 
        SET payment_status = 'completed'
        WHERE id = ? AND payment_status = 'pending'
      `, [orderId]);

      console.log(`✅ Payment marked complete for delivered order ${orderId}`);
    } catch (error) {
      console.error(`❌ Failed to update payment status for order ${orderId}:`, error);
    }
  }

  /**
   * Bulk update orders (for processing multiple orders)
   */
  static async bulkUpdateOrderStatus(updates: OrderStatusUpdate[]): Promise<number> {
    let successCount = 0;

    for (const update of updates) {
      try {
        await this.updateOrderStatus(update);
        successCount++;
      } catch (error) {
        console.error(`❌ Failed to update order ${update.orderId}:`, error);
      }
    }

    return successCount;
  }

  /**
   * Get order status updates history
   */
  static async getOrderStatusHistory(orderId: string) {
    try {
      const [history] = await pool.execute(`
        SELECT 
          osh.*,
          u.first_name,
          u.last_name
        FROM order_status_history osh
        LEFT JOIN users u ON osh.changed_by = u.id
        WHERE osh.order_id = ?
        ORDER BY osh.created_at ASC
      `, [orderId]);

      return history;
    } catch (error) {
      console.error('❌ Failed to get order status history:', error);
      return [];
    }
  }

  /**
   * Helper methods for display names and messages
   */
  private static getStatusDisplayName(status: string): string {
    const statusMap = {
      pending: 'Pending',
      confirmed: 'Confirmed',
      processing: 'Processing',
      shipped: 'Shipped',
      delivered: 'Delivered',
      cancelled: 'Cancelled'
    };
    return statusMap[status as keyof typeof statusMap] || status;
  }

  private static getAdminNotificationTitle(status: string, isNew: boolean): string {
    if (isNew) return 'New Order Received';
    
    const titleMap = {
      cancelled: 'Order Cancelled',
      delivered: 'Order Delivered',
      shipped: 'Order Shipped'
    };
    
    return titleMap[status as keyof typeof titleMap] || `Order Status Updated`;
  }

  private static getAdminNotificationMessage(order: any, update: OrderStatusUpdate, previousStatus: string): string {
    const customerName = `${order.first_name} ${order.last_name}`.trim();
    
    if (update.newStatus === 'confirmed' && previousStatus !== 'confirmed') {
      return `New order #${order.order_number} received from ${customerName}. Total: ₦${parseFloat(order.total_amount).toLocaleString()}`;
    }
    
    return `Order #${order.order_number} status changed from ${previousStatus} to ${update.newStatus}. Customer: ${customerName}`;
  }
}