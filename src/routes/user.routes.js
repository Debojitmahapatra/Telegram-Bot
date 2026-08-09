const { Router } = require('express');
const { body, param } = require('express-validator');

const userController = require('../controllers/user.controller');
const validateRequest = require('../middlewares/validateRequest');
const userPreferenceRoutes = require('./userPreference.routes');

const router = Router();
const userIdValidation = [param('id').isUUID().withMessage('id must be a valid UUID')];

router.use('/:userId/preferences', userPreferenceRoutes);

router.get('/:id', userIdValidation, validateRequest, userController.getUser);

router.put(
  '/:id',
  userIdValidation,
  [
    body('name').optional().trim().notEmpty().withMessage('name cannot be empty'),
    body('username').optional({ nullable: true }).trim().isLength({ max: 255 }),
    body('email').optional({ nullable: true }).trim().isEmail().withMessage('email must be valid'),
    body('timezone').optional().trim().notEmpty().withMessage('timezone cannot be empty'),
  ],
  validateRequest,
  userController.updateUser,
);

module.exports = router;
