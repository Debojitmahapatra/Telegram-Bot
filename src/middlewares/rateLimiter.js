const rateLimit = require('express-rate-limit');
const { getRateLimitConfig } = require('../config/env');

const apiLimiter = rateLimit({
  ...getRateLimitConfig(),
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests. Please try again later.' },
  skip: (req) => req.path === '/health',
});

const webhookLimiter = rateLimit({
  windowMs: 60 * 1_000,
  max: 120,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: { success: false, message: 'Too many webhook requests.' },
});

module.exports = { apiLimiter, webhookLimiter };
