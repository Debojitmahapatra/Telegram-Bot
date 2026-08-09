const { Router } = require('express');
const { body, param } = require('express-validator');

const preferenceController = require('../controllers/userPreference.controller');
const validateRequest = require('../middlewares/validateRequest');

const router = Router({ mergeParams: true });
const userIdValidation = [param('userId').isUUID().withMessage('userId must be a valid UUID')];
const stringList = (field) =>
  body(field)
    .optional()
    .isArray()
    .withMessage(`${field} must be an array of strings`)
    .bail()
    .custom((values) => values.every((value) => typeof value === 'string' && value.trim().length > 0))
    .withMessage(`${field} must contain non-empty strings`);

router.get('/', userIdValidation, validateRequest, preferenceController.getPreferences);

router.put(
  '/',
  userIdValidation,
  [
    body('role').optional({ nullable: true }).trim().isLength({ max: 100 }),
    stringList('preferredIndustries'),
    stringList('preferredCompanies'),
    stringList('preferredTopics'),
    body('dailyBriefTime')
      .optional({ nullable: true })
      .matches(/^([01]\d|2[0-3]):[0-5]\d$/)
      .withMessage('dailyBriefTime must use HH:mm format'),
    body('notificationEnabled').optional().isBoolean().withMessage('notificationEnabled must be a boolean'),
    body('timezone').optional().trim().notEmpty().withMessage('timezone cannot be empty'),
  ],
  validateRequest,
  preferenceController.updatePreferences,
);

module.exports = router;
