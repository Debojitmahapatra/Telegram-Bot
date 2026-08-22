jest.mock('../src/models/User', () => ({ findByPk: jest.fn() }));

const User = require('../src/models/User');
const userService = require('../src/services/user/user.service');

describe('User service', () => {
  test('returns a user by id', async () => {
    const user = { id: '123e4567-e89b-12d3-a456-426614174000' };
    User.findByPk.mockResolvedValue(user);

    await expect(userService.getUserById(user.id)).resolves.toBe(user);
  });

  test('returns not found for an unknown user', async () => {
    User.findByPk.mockResolvedValue(null);

    await expect(userService.getUserById('123e4567-e89b-12d3-a456-426614174000')).rejects.toMatchObject({
      statusCode: 404,
      message: 'User not found',
    });
  });

  test('updates only permitted profile fields', async () => {
    const user = { update: jest.fn().mockResolvedValue() };
    User.findByPk.mockResolvedValue(user);

    await userService.updateUserById('123e4567-e89b-12d3-a456-426614174000', {
      name: 'Ada',
      role: 'admin',
      telegramId: 'changed',
    });

    expect(user.update).toHaveBeenCalledWith({ name: 'Ada' });
  });
});
