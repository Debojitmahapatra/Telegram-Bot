const unsafeKeys = new Set(['__proto__', 'prototype', 'constructor']);

const sanitizeValue = (value) => {
  if (Array.isArray(value)) return value.map(sanitizeValue);
  if (!value || typeof value !== 'object') return value;

  Object.keys(value).forEach((key) => {
    if (unsafeKeys.has(key)) {
      delete value[key];
    } else {
      value[key] = sanitizeValue(value[key]);
    }
  });
  return value;
};

const sanitizeRequest = (req, res, next) => {
  if (req.body) sanitizeValue(req.body);
  next();
};

module.exports = sanitizeRequest;
