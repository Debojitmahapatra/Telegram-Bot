'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('messages', {
      id: { type: Sequelize.UUID, allowNull: false, primaryKey: true },
      conversationId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'conversations', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      role: {
        type: Sequelize.ENUM('user', 'assistant', 'system'),
        allowNull: false,
      },
      content: { type: Sequelize.TEXT, allowNull: false },
      metadata: { type: Sequelize.JSONB, allowNull: true },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn('NOW'),
      },
    });

    await queryInterface.addIndex('messages', ['conversationId', 'createdAt'], {
      name: 'messages_conversation_created_at_index',
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('messages');
  },
};
