const fs = require('fs/promises');
const path = require('path');
const { sequelize } = require('../../config/database');
const { User, FinancialDocument } = require('../../models');
const { enqueueDocumentProcessing } = require('../../queues/documentProcessing.queue');
const AppError = require('../../utils/AppError');
const { isPdfSignature } = require('../../config/upload');

const removeFile = async (filePath) => {
  if (filePath) await fs.unlink(filePath).catch(() => {});
};

const verifyPdfFile = async (file) => {
  if (!file) throw new AppError('A PDF document is required', 400);
  const handle = await fs.open(file.path, 'r');
  const buffer = Buffer.alloc(5);

  try {
    await handle.read(buffer, 0, 5, 0);
  } finally {
    await handle.close();
  }

  if (!isPdfSignature(buffer)) throw new AppError('Uploaded file is not a valid PDF', 400);
};

const uploadDocument = async ({ userId, file }) => {
  let document;

  try {
    await verifyPdfFile(file);
    const user = await User.findByPk(userId);
    if (!user) throw new AppError('User not found', 404);

    document = await sequelize.transaction((transaction) =>
      FinancialDocument.create({
        userId,
        fileName: path.basename(file.originalname),
        filePath: path.relative(process.cwd(), file.path),
        mimeType: file.mimetype,
        status: 'pending',
      }, { transaction }),
    );

    try {
      await enqueueDocumentProcessing({ documentId: document.id });
    } catch (error) {
      await document.update({ status: 'failed' });
      throw new AppError('Document processing queue is unavailable', 503);
    }

    return document;
  } catch (error) {
    if (!document) await removeFile(file?.path);
    throw error;
  }
};

module.exports = { uploadDocument };
