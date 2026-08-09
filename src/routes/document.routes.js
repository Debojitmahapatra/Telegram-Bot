const { Router } = require('express');
const { body, param } = require('express-validator');
const { uploadPdf } = require('../config/upload');
const documentController = require('../controllers/document.controller');
const validateRequest = require('../middlewares/validateRequest');

const router = Router();

router.post(
  '/upload',
  uploadPdf.single('document'),
  [body('userId').isUUID().withMessage('userId must be a valid UUID')],
  validateRequest,
  documentController.uploadDocument,
);
router.post(
  '/:id/questions',
  [
    param('id').isUUID().withMessage('id must be a valid UUID'),
    body('userId').isUUID().withMessage('userId must be a valid UUID'),
    body('question').trim().isLength({ min: 3, max: 2_000 }).withMessage('question must be 3-2000 characters'),
  ],
  validateRequest,
  documentController.askDocumentQuestion,
);

module.exports = router;
