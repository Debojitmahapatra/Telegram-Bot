const { User, UserPreference } = require('../../models');
const AppError = require('../../utils/AppError');

const ensureUserExists = async (userId) => {
  const user = await User.findByPk(userId);

  if (!user) {
    throw new AppError('User not found', 404);
  }
};

const getPreferences = async (userId) => {
  await ensureUserExists(userId);
  const preference = await UserPreference.findOne({ where: { userId } });

  if (!preference) {
    throw new AppError('User preferences not found', 404);
  }

  return preference;
};

const updatePreferences = async (userId, updates) => {
  await ensureUserExists(userId);

  const allowedFields = [
    'role',
    'preferredIndustries',
    'preferredCompanies',
    'preferredTopics',
    'dailyBriefTime',
    'notificationEnabled',
    'timezone',
  ];
  const safeUpdates = Object.fromEntries(
    Object.entries(updates).filter(([key]) => allowedFields.includes(key)),
  );

  const [preference, created] = await UserPreference.findOrCreate({
    where: { userId },
    defaults: { userId, ...safeUpdates },
  });

  if (!created) {
    await preference.update(safeUpdates);
  }

  return preference;
};

module.exports = { getPreferences, updatePreferences };
