const { FinancialDocument, DocumentChunk, UserPreference } = require('../../models');
const AppError = require('../../utils/AppError');
const aiService = require('../ai/ai.service');
const { retrieveRelevantChunks } = require('./documentChunk.service');

const askDocumentQuestion = async ({ documentId, userId, question }) => {
  const document = await FinancialDocument.findOne({ where: { id: documentId, userId } });
  if (!document) throw new AppError('Financial document not found', 404);
  if (document.status !== 'completed') throw new AppError('Document is not ready for questions', 409);

  const chunks = await DocumentChunk.findAll({
    where: { documentId },
    order: [['chunkIndex', 'ASC']],
  });
  if (!chunks.length) throw new AppError('No extracted document content is available', 409);

  const relevantChunks = retrieveRelevantChunks(chunks, question);
  const excerpts = relevantChunks
    .map((chunk) => `[Excerpt ${chunk.chunkIndex + 1}]\n${chunk.content}`)
    .join('\n\n');
  const preferences = await UserPreference.findOne({ where: { userId } });
  const answer = await aiService.generateResponse({
    userId,
    userMessage: `Answer the question using only the retrieved document excerpts below. If the answer is not supported by these excerpts, say so clearly.\n\nQuestion: ${question}\n\n--- EXCERPTS ---\n${excerpts}\n--- END EXCERPTS ---`,
    conversationHistory: [],
    userPreferences: preferences,
    userMemory: [],
  });

  return {
    answer,
    sources: relevantChunks.map(({ chunkIndex, score }) => ({ chunkIndex, relevanceScore: score })),
  };
};

module.exports = { askDocumentQuestion };
