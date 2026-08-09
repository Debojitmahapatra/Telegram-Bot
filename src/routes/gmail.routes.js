const { Router } = require('express');
const { body, query } = require('express-validator');
const gmailController = require('../controllers/gmail.controller');
const validateRequest = require('../middlewares/validateRequest');

const router = Router();
const userIdQuery = [query('userId').isUUID().withMessage('userId must be a valid UUID')];
const userIdAndQueryBody = [
  body('userId').isUUID().withMessage('userId must be a valid UUID'),
  body('query').trim().isLength({ min: 1, max: 500 }).withMessage('query must be 1-500 characters'),
];

router.get('/auth', userIdQuery, validateRequest, gmailController.startAuthorization);
router.get(
  '/callback',
  [query('code').notEmpty().withMessage('code is required'), query('state').notEmpty().withMessage('state is required')],
  validateRequest,
  gmailController.completeAuthorization,
);
router.post('/search', userIdAndQueryBody, validateRequest, gmailController.searchEmails);
router.post('/summarize', userIdAndQueryBody, validateRequest, gmailController.summarizeEmails);
router.post('/company-conversations', userIdAndQueryBody, validateRequest, gmailController.companyConversations);
router.post('/action-items', userIdAndQueryBody, validateRequest, gmailController.actionItems);

module.exports = router;
