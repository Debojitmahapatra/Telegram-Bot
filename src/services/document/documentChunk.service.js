const { sequelize } = require('../../config/database');
const { DocumentChunk } = require('../../models');

const CHUNK_SIZE = 1_200;
const CHUNK_OVERLAP = 150;

const chunkText = (text) => {
  const chunks = [];
  let start = 0;

  while (start < text.length) {
    let end = Math.min(start + CHUNK_SIZE, text.length);
    if (end < text.length) {
      const boundary = text.lastIndexOf(' ', end);
      if (boundary > start + CHUNK_SIZE / 2) end = boundary;
    }

    const content = text.slice(start, end).trim();
    if (content) chunks.push(content);
    start = end >= text.length ? text.length : end - CHUNK_OVERLAP;
  }

  return chunks;
};

const replaceDocumentChunks = async (documentId, text) => {
  const chunks = chunkText(text);
  await sequelize.transaction(async (transaction) => {
    await DocumentChunk.destroy({ where: { documentId }, transaction });
    await DocumentChunk.bulkCreate(
      chunks.map((content, chunkIndex) => ({ documentId, chunkIndex, content })),
      { transaction },
    );
  });
  return chunks.length;
};

const tokenize = (text) =>
  [...new Set(text.toLowerCase().match(/[a-z0-9]{3,}/g) || [])].slice(0, 20);

const retrieveRelevantChunks = (chunks, question, limit = 5) => {
  const terms = tokenize(question);
  return chunks
    .map((chunk) => {
      const plainChunk = typeof chunk.toJSON === 'function' ? chunk.toJSON() : chunk;
      const haystack = plainChunk.content.toLowerCase();
      const score = terms.reduce((total, term) => total + (haystack.split(term).length - 1), 0);
      return { ...plainChunk, score };
    })
    .sort((a, b) => b.score - a.score || a.chunkIndex - b.chunkIndex)
    .slice(0, limit);
};

module.exports = { chunkText, replaceDocumentChunks, retrieveRelevantChunks };
