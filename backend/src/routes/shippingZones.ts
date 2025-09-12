import express from 'express';
import { body } from 'express-validator';
import {
  getAllShippingZones,
  getActiveShippingZones,
  getShippingZone,
  createShippingZone,
  updateShippingZone,
  toggleShippingZoneStatus,
  deleteShippingZone,
  getShippingZoneStats
} from '../controllers/shippingZonesController';

const router = express.Router();

// Validation rules for shipping zone creation/update
const shippingZoneValidation = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Zone name must be between 2 and 100 characters')
    .matches(/^[a-zA-Z0-9\s\-_.()]+$/)
    .withMessage('Zone name can only contain letters, numbers, spaces, and basic punctuation'),
  
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description cannot exceed 500 characters'),
  
  body('price')
    .isFloat({ min: 0 })
    .withMessage('Price must be a positive number')
    .toFloat(),
  
  body('is_active')
    .optional()
    .isBoolean()
    .withMessage('is_active must be a boolean value')
    .toBoolean()
];

const updateShippingZoneValidation = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Zone name must be between 2 and 100 characters')
    .matches(/^[a-zA-Z0-9\s\-_.()]+$/)
    .withMessage('Zone name can only contain letters, numbers, spaces, and basic punctuation'),
  
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description cannot exceed 500 characters'),
  
  body('price')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Price must be a positive number')
    .toFloat(),
  
  body('is_active')
    .optional()
    .isBoolean()
    .withMessage('is_active must be a boolean value')
    .toBoolean()
];

// Admin routes (require admin authentication)
router.get('/', getAllShippingZones);
router.get('/stats', getShippingZoneStats);
router.get('/:id', getShippingZone);
router.post('/', shippingZoneValidation, createShippingZone);
router.put('/:id', updateShippingZoneValidation, updateShippingZone);
router.patch('/:id/toggle-status', toggleShippingZoneStatus);
router.delete('/:id', deleteShippingZone);

export default router;