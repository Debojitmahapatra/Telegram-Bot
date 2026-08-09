const alertService = require('../../alert/alert.service');

const createFinancialAlert = async ({ symbol, alertType, condition, threshold }, context) => {
  if (!context.userId) return { available: false, message: 'A user context is required to create an alert.' };

  try {
    const { alert, created } = await alertService.createAlert({
      userId: context.userId,
      symbol,
      alertType,
      condition,
      threshold,
    });
    return { available: true, created, data: alert };
  } catch (error) {
    return { available: false, message: error.message };
  }
};

module.exports = { createFinancialAlert };
