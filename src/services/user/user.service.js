const User = require('../../models/User');
const AppError = require('../../utils/AppError');

const getUserById = async (id) => {
  const user = await User.findByPk(id);

  if (!user) {
    throw new AppError('User not found', 404);
  }

  return user;
};

const updateUserById = async (id, updates) => {
  const user = await getUserById(id);
  const allowedUpdates = ['name', 'username', 'email', 'timezone'];
  const safeUpdates = Object.fromEntries(
    Object.entries(updates).filter(([key]) => allowedUpdates.includes(key)),
  );

  await user.update(safeUpdates);
  return user;
};

const findOrCreateTelegramUser = async (telegramUser, transaction) => {
  const telegramId = String(telegramUser.id);
  const name = [telegramUser.first_name, telegramUser.last_name].filter(Boolean).join(' ') || 'Telegram user';
  const [user, created] = await User.findOrCreate({
    where: { telegramId },
    defaults: { telegramId, name, username: telegramUser.username || null },
    transaction,
  });

  if (!created) {
    await user.update({ name, username: telegramUser.username || null }, { transaction });
  }

  return user;
};

module.exports = { getUserById, updateUserById, findOrCreateTelegramUser };
