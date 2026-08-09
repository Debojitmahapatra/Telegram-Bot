const preferenceService = require('../services/userPreference/userPreference.service');

const getPreferences = async (req, res, next) => {
  try {
    const preference = await preferenceService.getPreferences(req.params.userId);
    res.status(200).json({ success: true, data: preference });
  } catch (error) {
    next(error);
  }
};

const updatePreferences = async (req, res, next) => {
  try {
    const preference = await preferenceService.updatePreferences(req.params.userId, req.body);
    res.status(200).json({ success: true, data: preference });
  } catch (error) {
    next(error);
  }
};

module.exports = { getPreferences, updatePreferences };
