'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('google_integrations', {
      id: { type: Sequelize.UUID, allowNull: false, primaryKey: true },
      userId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'users', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      provider: { type: Sequelize.STRING, allowNull: false, defaultValue: 'gmail' },
      accessToken: { type: Sequelize.TEXT, allowNull: false },
      refreshToken: { type: Sequelize.TEXT, allowNull: true },
      expiryDate: { type: Sequelize.DATE, allowNull: true },
      createdAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') },
      updatedAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') },
    });
    await queryInterface.addIndex('google_integrations', ['userId', 'provider'], {
      unique: true,
      name: 'google_integrations_user_provider_unique',
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('google_integrations');
  },
};
