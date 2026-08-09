const watchlistService = require('../../watchlist/watchlist.service');

const addToWatchlist = async ({ symbol, companyName }, context) => {
  if (!context.userId) {
    return { available: false, message: 'A user context is required to update a watchlist.' };
  }

  try {
    const { item, created } = await watchlistService.addWatchlistItem({
      userId: context.userId,
      symbol,
      companyName,
    });
    return { available: true, created, data: item };
  } catch (error) {
    return { available: false, message: error.message };
  }
};

module.exports = { addToWatchlist };
