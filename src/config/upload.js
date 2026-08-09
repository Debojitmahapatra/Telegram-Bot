const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const multer = require('multer');
const AppError = require('../utils/AppError');

const uploadDirectory = path.resolve(process.cwd(), 'uploads', 'documents');
fs.mkdirSync(uploadDirectory, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, callback) => callback(null, uploadDirectory),
  filename: (req, file, callback) => callback(null, `${crypto.randomUUID()}.pdf`),
});

const uploadPdf = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024, files: 1, fields: 5 },
  fileFilter: (req, file, callback) => {
    const hasPdfExtension = file.originalname.toLowerCase().endsWith('.pdf');
    if (file.mimetype !== 'application/pdf' || !hasPdfExtension) {
      return callback(new AppError('Only PDF documents are allowed', 400));
    }
    callback(null, true);
  },
});

const isPdfSignature = (buffer) => buffer.subarray(0, 5).toString() === '%PDF-';

module.exports = { uploadPdf, isPdfSignature };
