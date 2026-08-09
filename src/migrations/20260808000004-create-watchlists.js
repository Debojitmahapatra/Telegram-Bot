'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('watchlists', {
      id: { type: Sequelize.UUID, allowNull: false, primaryKey: true },
      userId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'users', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      symbol: { type: Sequelize.STRING(10), allowNull: false },
      companyName: { type: Sequelize.STRING, allowNull: false },
      createdAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') },
      updatedAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') },
    });

    await queryInterface.addIndex('watchlists', ['userId', 'symbol'], {
      unique: true,
      name: 'watchlists_user_symbol_unique',
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('watchlists');
  },
};
