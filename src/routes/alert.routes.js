const { Router } = require('express');
const { body, param, query } = require('express-validator');
const alertController = require('../controllers/alert.controller');
const validateRequest = require('../middlewares/validateRequest');

const router = Router();
const paginationValidation = [
  query('page').optional().isInt({ min: 1 }).withMessage('page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('limit must be between 1 and 100'),
];

router.post(
  '/',
  [
    body('userId').isUUID().withMessage('userId must be a valid UUID'),
    body('symbol').trim().matches(/^[A-Za-z.]{1,10}$/).withMessage('symbol must be a valid ticker symbol'),
    body('alertType').isIn(['price_movement', 'important_news']).withMessage('alertType is invalid'),
    body('condition').isIn(['percentage_change', 'new_news']).withMessage('condition is invalid'),
    body('threshold').optional({ nullable: true }).isFloat({ gt: 0 }).withMessage('threshold must be positive'),
    body().custom((value) => {
      const isPriceMovement = value.alertType === 'price_movement' && value.condition === 'percentage_change';
      const isImportantNews = value.alertType === 'important_news' && value.condition === 'new_news';
      if (!isPriceMovement && !isImportantNews) throw new Error('alertType and condition do not match');
      if (isPriceMovement && value.threshold == null) throw new Error('threshold is required for price movement alerts');
      if (isImportantNews && value.threshold != null) throw new Error('threshold is not allowed for news alerts');
      return true;
    }),
  ],
  validateRequest,
  alertController.createAlert,
);
router.get(
  '/',
  [query('userId').isUUID().withMessage('userId must be a valid UUID'), ...paginationValidation],
  validateRequest,
  alertController.listAlerts,
);
router.delete(
  '/:id',
  [param('id').isUUID().withMessage('id must be a valid UUID')],
  validateRequest,
  alertController.deleteAlert,
);

module.exports = router;
