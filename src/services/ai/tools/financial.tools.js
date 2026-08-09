const financialData = require('../../../integrations/financial/financialData.service');

const unavailableResult = (tool, symbol, error) => ({
  available: false,
  tool,
  symbol,
  message: error?.message || 'Verified financial data is unavailable. Do not treat this as current market information.',
});

const runTool = async (tool, value, action) => {
  try {
    return {
      available: true,
      tool,
      source: 'Financial Modeling Prep',
      retrievedAt: new Date().toISOString(),
      data: await action(value),
    };
  } catch (error) {
    return unavailableResult(tool, value, error);
  }
};

const getCompanyProfile = async ({ symbol }) => runTool('getCompanyProfile', symbol, financialData.getCompanyProfile);
const getStockPrice = async ({ symbol }) => runTool('getStockPrice', symbol, financialData.getStockPrice);
const getCompanyNews = async ({ symbol }) => runTool('getCompanyNews', symbol, financialData.getCompanyNews);
const getFinancialMetrics = async ({ symbol }) => runTool('getFinancialMetrics', symbol, financialData.getFinancialMetrics);
const searchFinancialNews = async ({ query }) => runTool('searchFinancialNews', query, financialData.searchFinancialNews);
const getEarnings = async ({ symbol }) => runTool('getEarnings', symbol, financialData.getEarnings);
const getSecFilings = async ({ symbol }) => unavailableResult('getSecFilings', symbol);

module.exports = {
  getCompanyProfile,
  getStockPrice,
  getCompanyNews,
  getFinancialMetrics,
  searchFinancialNews,
  getEarnings,
  getSecFilings,
};
