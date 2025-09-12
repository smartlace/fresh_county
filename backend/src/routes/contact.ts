import { Router } from 'express';
import { body, validationResult } from 'express-validator';
import { ContactController } from '../controllers/contactController';

const router = Router();

// Validation middleware for MaaS order
const maasOrderValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  body('product')
    .notEmpty()
    .trim()
    .withMessage('Product selection is required'),
  body('message')
    .optional()
    .trim()
    .isLength({ max: 2000 })
    .withMessage('Message must not exceed 2000 characters')
];

// Validation middleware for general contact
const contactFormValidation = [
  body('name')
    .notEmpty()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  body('subject')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Subject must not exceed 200 characters'),
  body('message')
    .notEmpty()
    .trim()
    .isLength({ min: 10, max: 2000 })
    .withMessage('Message must be between 10 and 2000 characters')
];

// Validation error handler
const handleValidationErrors = (req: any, res: any, next: any) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }
  next();
};

// MaaS order submission endpoint
router.post('/maas-order', 
  maasOrderValidation, 
  handleValidationErrors, 
  ContactController.submitMaasOrder
);

// General contact form submission endpoint
router.post('/contact', 
  contactFormValidation, 
  handleValidationErrors, 
  ContactController.submitContactForm
);

export default router;