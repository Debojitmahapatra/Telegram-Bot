const watchlistService = require('../services/watchlist/watchlist.service');

const createWatchlistItem = async (req, res, next) => {
  try {
    const { item, created } = await watchlistService.addWatchlistItem(req.body);
    res.status(created ? 201 : 200).json({ success: true, data: item, created });
  } catch (error) {
    next(error);
  }
};

const listWatchlistItems = async (req, res, next) => {
  try {
    const data = await watchlistService.listWatchlistItems(req.query.userId, req.query.page, req.query.limit);
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

const deleteWatchlistItem = async (req, res, next) => {
  try {
    await watchlistService.deleteWatchlistItem(req.params.id);
    res.status(200).json({ success: true, message: 'Watchlist item deleted' });
  } catch (error) {
    next(error);
  }
};

module.exports = { createWatchlistItem, listWatchlistItems, deleteWatchlistItem };
