const { Router } = require('express');
const { body, param, query } = require('express-validator');
const watchlistController = require('../controllers/watchlist.controller');
const validateRequest = require('../middlewares/validateRequest');

const router = Router();
const symbolValidation = body('symbol')
  .trim()
  .matches(/^[A-Za-z.]{1,10}$/)
  .withMessage('symbol must be a valid ticker symbol');
const paginationValidation = [
  query('page').optional().isInt({ min: 1 }).withMessage('page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('limit must be between 1 and 100'),
];

router.post(
  '/',
  [
    body('userId').isUUID().withMessage('userId must be a valid UUID'),
    symbolValidation,
    body('companyName').trim().notEmpty().isLength({ max: 255 }).withMessage('companyName is required'),
  ],
  validateRequest,
  watchlistController.createWatchlistItem,
);
router.get(
  '/',
  [query('userId').isUUID().withMessage('userId must be a valid UUID'), ...paginationValidation],
  validateRequest,
  watchlistController.listWatchlistItems,
);
router.delete(
  '/:id',
  [param('id').isUUID().withMessage('id must be a valid UUID')],
  validateRequest,
  watchlistController.deleteWatchlistItem,
);

module.exports = router;
