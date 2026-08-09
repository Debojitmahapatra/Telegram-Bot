const documentService = require('../services/document/document.service');

const uploadDocument = async (req, res, next) => {
  try {
    const document = await documentService.uploadDocument({ userId: req.body.userId, file: req.file });
    res.status(202).json({ success: true, data: document });
  } catch (error) {
    next(error);
  }
};

const askDocumentQuestion = async (req, res, next) => {
  try {
    const documentQaService = require('../services/document/documentQa.service');
    const data = await documentQaService.askDocumentQuestion({
      documentId: req.params.id,
      userId: req.body.userId,
      question: req.body.question,
    });
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

module.exports = { uploadDocument, askDocumentQuestion };
