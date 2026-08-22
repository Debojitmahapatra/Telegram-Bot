const { Router } = require('express');
const { body, query } = require('express-validator');
const calendarController = require('../controllers/calendar.controller');
const validateRequest = require('../middlewares/validateRequest');

const router = Router();

router.post(
  '/events',
  [
    body('userId').isUUID().withMessage('userId must be a valid UUID'),
    body('title').trim().isLength({ min: 1, max: 255 }).withMessage('title is required'),
    body('startDateTime').isISO8601().withMessage('startDateTime must be ISO 8601'),
    body('endDateTime').isISO8601().withMessage('endDateTime must be ISO 8601'),
    body('timeZone').trim().notEmpty().withMessage('timeZone is required'),
    body('attendees').optional().isArray().withMessage('attendees must be an array'),
    body('attendees.*').optional().isEmail().withMessage('attendees must contain valid email addresses'),
  ],
  validateRequest,
  calendarController.createEvent,
);
router.get(
  '/events',
  [
    query('userId').isUUID().withMessage('userId must be a valid UUID'),
    query('timeMin').optional().isISO8601().withMessage('timeMin must be ISO 8601'),
    query('timeMax').optional().isISO8601().withMessage('timeMax must be ISO 8601'),
    query('query').optional().trim().isLength({ max: 500 }),
  ],
  validateRequest,
  calendarController.findEvents,
);
router.post(
  '/reminders',
  [
    body('userId').isUUID().withMessage('userId must be a valid UUID'),
    body('title').trim().isLength({ min: 1, max: 255 }).withMessage('title is required'),
    body('remindAt').isISO8601().withMessage('remindAt must be ISO 8601'),
    body('timeZone').trim().notEmpty().withMessage('timeZone is required'),
  ],
  validateRequest,
  calendarController.createReminder,
);
router.post(
  '/summary',
  [
    body('userId').isUUID().withMessage('userId must be a valid UUID'),
    body('query').optional().trim().isLength({ max: 500 }),
  ],
  validateRequest,
  calendarController.summarizeEvents,
);

module.exports = router;
