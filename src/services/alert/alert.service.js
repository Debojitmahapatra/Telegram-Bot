const { Alert, User } = require('../../models');
const AppError = require('../../utils/AppError');
const { getPagination, getPaginationMeta } = require('../../utils/pagination');

const ensureUserExists = async (userId) => {
  const user = await User.findByPk(userId);
  if (!user) throw new AppError('User not found', 404);
};

const validateAlertDefinition = ({ alertType, condition, threshold }) => {
  const isPriceMovement = alertType === 'price_movement' && condition === 'percentage_change';
  const isImportantNews = alertType === 'important_news' && condition === 'new_news';

  if (!isPriceMovement && !isImportantNews) {
    throw new AppError('alertType and condition do not form a supported alert', 400);
  }
  if (isPriceMovement && (!Number.isFinite(Number(threshold)) || Number(threshold) <= 0)) {
    throw new AppError('A positive threshold is required for price movement alerts', 400);
  }
  if (isImportantNews && threshold != null) {
    throw new AppError('News alerts do not use a threshold', 400);
  }
};

const createAlert = async ({ userId, symbol, alertType, condition, threshold }) => {
  await ensureUserExists(userId);
  validateAlertDefinition({ alertType, condition, threshold });
  const normalizedSymbol = symbol.trim().toUpperCase();
  const [alert, created] = await Alert.findOrCreate({
    where: { userId, symbol: normalizedSymbol, alertType, condition, threshold: threshold ?? null },
    defaults: { userId, symbol: normalizedSymbol, alertType, condition, threshold: threshold ?? null },
  });
  return { alert, created };
};

const listAlerts = async (userId, pageValue, limitValue) => {
  await ensureUserExists(userId);
  const { page, limit, offset } = getPagination(pageValue, limitValue);
  const { count, rows } = await Alert.findAndCountAll({
    where: { userId },
    order: [['createdAt', 'DESC']],
    limit,
    offset,
  });
  return { alerts: rows, pagination: getPaginationMeta(count, page, limit) };
};

const deleteAlert = async (id) => {
  const alert = await Alert.findByPk(id);
  if (!alert) throw new AppError('Alert not found', 404);
  await alert.destroy();
};

module.exports = { createAlert, listAlerts, deleteAlert, validateAlertDefinition };
