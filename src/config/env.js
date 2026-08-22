const AppError = require('../utils/AppError');

const getCorsOrigins = () =>
  (process.env.CORS_ORIGIN || '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

const getRateLimitConfig = () => ({
  windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1_000,
  max: Number(process.env.RATE_LIMIT_MAX) || 100,
});

const validateEnvironment = () => {
  const nodeEnv = process.env.NODE_ENV || 'development';
  if (!['development', 'test', 'production'].includes(nodeEnv)) {
    throw new AppError('NODE_ENV must be development, test, or production', 500);
  }

  const port = Number(process.env.PORT) || 5000;
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new AppError('PORT must be a valid network port', 500);
  }

  if (nodeEnv === 'production' && !process.env.CORS_ORIGIN) {
    throw new AppError('CORS_ORIGIN must be configured in production', 500);
  }
};

module.exports = { getCorsOrigins, getRateLimitConfig, validateEnvironment };
