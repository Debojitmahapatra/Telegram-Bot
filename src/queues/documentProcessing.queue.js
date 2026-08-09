const { createQueue } = require('./queueFactory');

const documentProcessingQueue = createQueue('document-processing');

const enqueueDocumentProcessing = (data, options = {}) =>
  documentProcessingQueue.add('process-document', data, options);

module.exports = { documentProcessingQueue, enqueueDocumentProcessing };
