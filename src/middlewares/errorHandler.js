const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  console.error('Request failed', {
    name: err.name,
    message: err.message,
    statusCode,
    method: req.method,
    path: req.path,
  });

  if (err instanceof SyntaxError && 'body' in err) {
    return res.status(400).json({ success: false, message: 'Malformed JSON request body' });
  }

  if (err.name === 'MulterError') {
    return res.status(400).json({
      success: false,
      message: err.code === 'LIMIT_FILE_SIZE' ? 'PDF file must not exceed 10 MB' : 'Invalid file upload',
    });
  }

  if (err.name === 'SequelizeValidationError') {
    return res.status(400).json({
      success: false,
      message: err.errors.map((item) => item.message).join(', '),
    });
  }

  if (err.name === 'SequelizeUniqueConstraintError') {
    return res.status(409).json({
      success: false,
      message: err.errors.map((item) => item.message).join(', '),
    });
  }

  const message = statusCode >= 500 && process.env.NODE_ENV === 'production'
    ? 'Internal server error'
    : err.message || 'Internal server error';

  res.status(statusCode).json({
    success: false,
    message,
  });
};

module.exports = errorHandler;
