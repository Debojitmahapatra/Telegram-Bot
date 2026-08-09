const { Router } = require('express');
const { body, param, query } = require('express-validator');

const conversationController = require('../controllers/conversation.controller');
const validateRequest = require('../middlewares/validateRequest');

const router = Router();
const conversationIdValidation = [param('id').isUUID().withMessage('id must be a valid UUID')];
const paginationValidation = [
  query('page').optional().isInt({ min: 1 }).withMessage('page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('limit must be between 1 and 100'),
];

router.post(
  '/',
  [
    body('userId').isUUID().withMessage('userId must be a valid UUID'),
    body('title').optional().trim().isLength({ min: 1, max: 255 }).withMessage('title must be 1-255 characters'),
  ],
  validateRequest,
  conversationController.createConversation,
);
router.get(
  '/',
  [query('userId').isUUID().withMessage('userId must be a valid UUID'), ...paginationValidation],
  validateRequest,
  conversationController.listConversations,
);
router.get('/:id/messages', conversationIdValidation, paginationValidation, validateRequest, conversationController.listMessages);
router.get('/:id', conversationIdValidation, validateRequest, conversationController.getConversation);

module.exports = router;
