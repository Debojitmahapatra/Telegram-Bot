const processFinancialUpdate = async (job) => ({ status: 'deferred', jobId: job.id });

module.exports = { processFinancialUpdate };
