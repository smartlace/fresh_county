import { createEmailTransporter, defaultEmailConfig } from '../config/email';
import Handlebars from 'handlebars';
import path from 'path';
import fs from 'fs/promises';

// Email template data interfaces
export interface OrderEmailData {
  customerName: string;
  orderNumber: string;
  orderDate: string;
  orderTotal: string;
  orderStatus: string;
  items: Array<{
    name: string;
    quantity: number;
    price: string;
    total: string;
    image?: string;
  }>;
  shippingAddress: {
    name: string;
    street: string;
    city: string;
    state: string;
    country: string;
    zipCode: string;
  };
  subtotal: string;
  taxAmount: string;
  shippingCost: string;
  discount?: string;
  trackingNumber?: string;
  estimatedDelivery?: string;
}

export interface UserEmailData {
  firstName: string;
  lastName: string;
  email: string;
  resetToken?: string;
  verificationToken?: string;
  loginDate?: string;
}

export interface PasswordResetSuccessData {
  firstName: string;
  lastName: string;
  email: string;
  changeDate: string;
  changeTime: string;
  ipAddress: string;
  userAgent: string;
}

export interface AdminNotificationData {
  type: 'new_order' | 'low_stock' | 'user_registration' | 'payment_failed';
  title: string;
  message: string;
  data: any;
  timestamp: string;
}

// Email service class
export class EmailService {
  private transporter: any;
  private templatesLoaded: Map<string, HandlebarsTemplateDelegate> = new Map();

  constructor() {
    this.initializeTransporter();
    this.preloadTemplates();
  }

  // Initialize transporter asynchronously
  private async initializeTransporter() {
    try {
      this.transporter = await createEmailTransporter();
    } catch (error) {
      console.error('Failed to initialize email transporter:', error);
    }
  }

  // Ensure transporter is ready
  private async ensureTransporter() {
    if (!this.transporter) {
      await this.initializeTransporter();
    }
    return this.transporter;
  }

  // Preload email templates
  private async preloadTemplates() {
    const templateDir = path.join(__dirname, '../templates/email');
    const templates = [
      'order-confirmation',
      'order-shipped',
      'order-delivered',
      'order-cancelled',
      'password-reset',
      'password-reset-success',
      'welcome',
      'admin-notification'
    ];

    for (const template of templates) {
      try {
        const templatePath = path.join(templateDir, `${template}.hbs`);
        const templateContent = await fs.readFile(templatePath, 'utf-8');
        const compiledTemplate = Handlebars.compile(templateContent);
        this.templatesLoaded.set(template, compiledTemplate);
      } catch (error) {
        console.warn(`Warning: Email template ${template} not found, using fallback`);
      }
    }
  }

  // Get template (with fallback)
  private getTemplate(templateName: string): HandlebarsTemplateDelegate {
    const template = this.templatesLoaded.get(templateName);
    if (template) {
      return template;
    }

    // Fallback to basic template
    return this.createFallbackTemplate(templateName);
  }

  // Create fallback template when file is missing
  private createFallbackTemplate(templateName: string): HandlebarsTemplateDelegate {
    const fallbackTemplates: { [key: string]: string } = {
      'order-confirmation': `
        <h2>Order Confirmation</h2>
        <p>Dear {{customerName}},</p>
        <p>Your order #{{orderNumber}} has been confirmed.</p>
        <p>Order Total: {{orderTotal}}</p>
        <p>Thank you for shopping with {{companyName}}!</p>
      `,
      'order-shipped': `
        <h2>Order Shipped</h2>
        <p>Dear {{customerName}},</p>
        <p>Your order #{{orderNumber}} has been shipped.</p>
        {{#if trackingNumber}}<p>Tracking Number: {{trackingNumber}}</p>{{/if}}
        <p>Thank you for shopping with {{companyName}}!</p>
      `,
      'welcome': `
        <h2>Welcome to {{companyName}}!</h2>
        <p>Dear {{firstName}},</p>
        <p>Welcome to {{companyName}}! We're excited to have you as a customer.</p>
        <p>Start shopping for fresh, quality products today!</p>
      `,
      'password-reset': `
        <h2>Password Reset</h2>
        <p>Dear {{firstName}},</p>
        <p>You requested a password reset. Click the link below to reset your password:</p>
        <p><a href="{{resetLink}}">Reset Password</a></p>
        <p>This link expires in 1 hour.</p>
      `
    };

    const fallbackContent = fallbackTemplates[templateName] || `
      <h2>{{title}}</h2>
      <p>{{message}}</p>
    `;

    return Handlebars.compile(fallbackContent);
  }

  // Send order confirmation email
  async sendOrderConfirmation(email: string, orderData: OrderEmailData): Promise<boolean> {
    try {
      const template = this.getTemplate('order-confirmation');
      const html = template({
        ...orderData,
        ...defaultEmailConfig
      });

      const mailOptions = {
        from: defaultEmailConfig.from,
        to: email,
        subject: `Order Confirmation - #${orderData.orderNumber}`,
        html,
        replyTo: defaultEmailConfig.replyTo
      };

      const transporter = await this.ensureTransporter();
      await transporter.sendMail(mailOptions);
      console.log(`✅ Order confirmation email sent to ${email}`);
      return true;
    } catch (error) {
      console.error('❌ Failed to send order confirmation email:', error);
      return false;
    }
  }

  // Send order status update email
  async sendOrderStatusUpdate(email: string, orderData: OrderEmailData): Promise<boolean> {
    try {
      // Skip sending email for shipped status to reduce customer email fatigue
      if (orderData.orderStatus.toLowerCase() === 'shipped') {
        console.log(`ℹ️ Skipping shipped email notification for order ${orderData.orderNumber} (status display only)`);
        return true; // Return success without sending email
      }

      let templateName = 'order-confirmation';
      let subject = `Order Update - #${orderData.orderNumber}`;

      switch (orderData.orderStatus.toLowerCase()) {
        case 'delivered':
          templateName = 'order-delivered';
          subject = `Order Delivered - #${orderData.orderNumber}`;
          break;
        case 'cancelled':
          templateName = 'order-cancelled';
          subject = `Order Cancelled - #${orderData.orderNumber}`;
          break;
      }

      const template = this.getTemplate(templateName);
      const html = template({
        ...orderData,
        ...defaultEmailConfig
      });

      const mailOptions = {
        from: defaultEmailConfig.from,
        to: email,
        subject,
        html,
        replyTo: defaultEmailConfig.replyTo
      };

      const transporter = await this.ensureTransporter();
      await transporter.sendMail(mailOptions);
      console.log(`✅ Order status email sent to ${email}`);
      return true;
    } catch (error) {
      console.error('❌ Failed to send order status email:', error);
      return false;
    }
  }

  // Send welcome email
  async sendWelcomeEmail(email: string, userData: UserEmailData): Promise<boolean> {
    try {
      const template = this.getTemplate('welcome');
      const html = template({
        ...userData,
        ...defaultEmailConfig
      });

      const mailOptions = {
        from: defaultEmailConfig.from,
        to: email,
        subject: `Welcome to ${defaultEmailConfig.companyName}!`,
        html,
        replyTo: defaultEmailConfig.replyTo
      };

      const transporter = await this.ensureTransporter();
      await transporter.sendMail(mailOptions);
      console.log(`✅ Welcome email sent to ${email}`);
      return true;
    } catch (error) {
      console.error('❌ Failed to send welcome email:', error);
      return false;
    }
  }

  // Send password reset email
  async sendPasswordResetEmail(email: string, userData: UserEmailData): Promise<boolean> {
    try {
      const template = this.getTemplate('password-reset');
      const resetLink = `${defaultEmailConfig.websiteUrl}/auth/reset-password?token=${userData.resetToken}`;
      
      const html = template({
        ...userData,
        resetLink,
        ...defaultEmailConfig
      });

      const mailOptions = {
        from: defaultEmailConfig.from,
        to: email,
        subject: 'Password Reset Request',
        html,
        replyTo: defaultEmailConfig.replyTo
      };

      const transporter = await this.ensureTransporter();
      await transporter.sendMail(mailOptions);
      console.log(`✅ Password reset email sent to ${email}`);
      return true;
    } catch (error) {
      console.error('❌ Failed to send password reset email:', error);
      return false;
    }
  }

  // Send admin notification email
  async sendAdminNotification(notificationData: AdminNotificationData): Promise<boolean> {
    try {
      const adminEmails = process.env.ADMIN_EMAILS?.split(',') || ['admin@freshcounty.com'];
      
      const template = this.getTemplate('admin-notification');
      const html = template({
        ...notificationData,
        ...defaultEmailConfig
      });

      const mailOptions = {
        from: defaultEmailConfig.from,
        to: adminEmails,
        subject: `Admin Alert: ${notificationData.title}`,
        html,
        replyTo: defaultEmailConfig.replyTo
      };

      const transporter = await this.ensureTransporter();
      await transporter.sendMail(mailOptions);
      console.log(`✅ Admin notification email sent`);
      return true;
    } catch (error) {
      console.error('❌ Failed to send admin notification email:', error);
      return false;
    }
  }

  // Send password reset success email
  async sendPasswordResetSuccessEmail(email: string, resetData: PasswordResetSuccessData): Promise<boolean> {
    try {
      const template = this.getTemplate('password-reset-success');
      
      const html = template({
        ...resetData,
        ...defaultEmailConfig
      });

      const mailOptions = {
        from: defaultEmailConfig.from,
        to: email,
        subject: `Password Changed Successfully - ${defaultEmailConfig.companyName}`,
        html,
        replyTo: defaultEmailConfig.replyTo
      };

      const transporter = await this.ensureTransporter();
      await transporter.sendMail(mailOptions);
      console.log(`✅ Password reset success email sent to ${email}`);
      return true;
    } catch (error) {
      console.error('❌ Failed to send password reset success email:', error);
      return false;
    }
  }

  // Test email connection
  async testConnection(): Promise<boolean> {
    try {
      const transporter = await this.ensureTransporter();
    await transporter.verify();
      console.log('✅ Email service connection verified');
      return true;
    } catch (error) {
      console.error('❌ Email service connection failed:', error);
      return false;
    }
  }
}

// Export singleton instance
export const emailService = new EmailService();