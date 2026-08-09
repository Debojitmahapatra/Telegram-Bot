'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('alerts', {
      id: { type: Sequelize.UUID, allowNull: false, primaryKey: true },
      userId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'users', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      symbol: { type: Sequelize.STRING(10), allowNull: false },
      alertType: { type: Sequelize.ENUM('price_movement', 'important_news'), allowNull: false },
      condition: { type: Sequelize.STRING, allowNull: false },
      threshold: { type: Sequelize.DECIMAL(10, 2), allowNull: true },
      isActive: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: true },
      lastTriggeredAt: { type: Sequelize.DATE, allowNull: true },
      createdAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') },
      updatedAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') },
    });

    await queryInterface.addIndex('alerts', ['userId', 'isActive'], { name: 'alerts_user_active_index' });
    await queryInterface.addIndex('alerts', ['symbol', 'isActive'], { name: 'alerts_symbol_active_index' });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('alerts');
  },
};
