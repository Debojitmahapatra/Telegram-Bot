const { User, Watchlist } = require('../../models');
const AppError = require('../../utils/AppError');
const { getPagination, getPaginationMeta } = require('../../utils/pagination');

const ensureUserExists = async (userId) => {
  const user = await User.findByPk(userId);
  if (!user) throw new AppError('User not found', 404);
};

const addWatchlistItem = async ({ userId, symbol, companyName }) => {
  await ensureUserExists(userId);
  const normalizedSymbol = symbol.trim().toUpperCase();
  const [item, created] = await Watchlist.findOrCreate({
    where: { userId, symbol: normalizedSymbol },
    defaults: { userId, symbol: normalizedSymbol, companyName: companyName.trim() },
  });

  return { item, created };
};

const listWatchlistItems = async (userId, pageValue, limitValue) => {
  await ensureUserExists(userId);
  const { page, limit, offset } = getPagination(pageValue, limitValue);
  const { count, rows } = await Watchlist.findAndCountAll({
    where: { userId },
    order: [['createdAt', 'DESC']],
    limit,
    offset,
  });

  return { items: rows, pagination: getPaginationMeta(count, page, limit) };
};

const deleteWatchlistItem = async (id) => {
  const item = await Watchlist.findByPk(id);
  if (!item) throw new AppError('Watchlist item not found', 404);
  await item.destroy();
};

module.exports = { addWatchlistItem, listWatchlistItems, deleteWatchlistItem };
