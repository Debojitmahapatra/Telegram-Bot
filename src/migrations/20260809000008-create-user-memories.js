'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('user_memories', {
      id: { type: Sequelize.UUID, allowNull: false, primaryKey: true },
      userId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'users', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      memoryType: { type: Sequelize.STRING, allowNull: false },
      memoryKey: { type: Sequelize.STRING, allowNull: false },
      memoryValue: { type: Sequelize.TEXT, allowNull: false },
      confidence: { type: Sequelize.DECIMAL(3, 2), allowNull: false, defaultValue: 0.8 },
      createdAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') },
      updatedAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') },
    });
    await queryInterface.addIndex('user_memories', ['userId', 'memoryType', 'memoryKey'], {
      unique: true,
      name: 'user_memories_user_type_key_unique',
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('user_memories');
  },
};
