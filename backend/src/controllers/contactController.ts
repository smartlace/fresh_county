import { Request, Response } from 'express';
import { emailService, AdminNotificationData } from '../services/emailService';

export class ContactController {

  // Handle MaaS order form submission
  static async submitMaasOrder(req: Request, res: Response) {
    try {
      const { email, product, message } = req.body;

      // Validate required fields
      if (!email || !product) {
        return res.status(400).json({
          success: false,
          message: 'Email and product selection are required'
        });
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({
          success: false,
          message: 'Please provide a valid email address'
        });
      }

      // Create admin notification data for MaaS order
      const adminNotification: AdminNotificationData = {
        type: 'new_order',
        title: 'New MaaS Order Inquiry',
        message: `New MaaS order inquiry received for ${product} from ${email}`,
        data: {
          customerEmail: email,
          productRequested: product,
          customerMessage: message || 'No additional message provided',
          inquiryType: 'MaaS Order',
          submittedAt: new Date().toISOString(),
          priority: 'normal'
        },
        timestamp: new Date().toISOString()
      };

      // Send notification to admin email
      const emailSent = await emailService.sendAdminNotification(adminNotification);

      if (emailSent) {
        res.json({
          success: true,
          message: 'Your MaaS order inquiry has been submitted successfully. Our team will contact you soon.'
        });
      } else {
        res.status(500).json({
          success: false,
          message: 'Failed to submit inquiry. Please try again later.'
        });
      }

    } catch (error) {
      console.error('MaaS order submission error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error. Please try again later.'
      });
    }
  }

  // Handle general contact form submission
  static async submitContactForm(req: Request, res: Response) {
    try {
      const { name, email, subject, message } = req.body;

      // Validate required fields
      if (!name || !email || !message) {
        return res.status(400).json({
          success: false,
          message: 'Name, email, and message are required'
        });
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({
          success: false,
          message: 'Please provide a valid email address'
        });
      }

      // Create admin notification data for general contact
      const adminNotification: AdminNotificationData = {
        type: 'user_registration',
        title: 'New Contact Form Submission',
        message: `New contact form submission from ${name} (${email})`,
        data: {
          customerName: name,
          customerEmail: email,
          subject: subject || 'No subject provided',
          customerMessage: message,
          inquiryType: 'General Contact',
          submittedAt: new Date().toISOString(),
          priority: 'normal'
        },
        timestamp: new Date().toISOString()
      };

      // Send notification to admin email
      const emailSent = await emailService.sendAdminNotification(adminNotification);

      if (emailSent) {
        res.json({
          success: true,
          message: 'Your message has been sent successfully. We will get back to you soon.'
        });
      } else {
        res.status(500).json({
          success: false,
          message: 'Failed to send message. Please try again later.'
        });
      }

    } catch (error) {
      console.error('Contact form submission error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error. Please try again later.'
      });
    }
  }
}