'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('financial_documents', {
      id: { type: Sequelize.UUID, allowNull: false, primaryKey: true },
      userId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'users', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      fileName: { type: Sequelize.STRING, allowNull: false },
      filePath: { type: Sequelize.STRING, allowNull: false },
      mimeType: { type: Sequelize.STRING, allowNull: false },
      status: {
        type: Sequelize.ENUM('pending', 'processing', 'completed', 'failed'),
        allowNull: false,
        defaultValue: 'pending',
      },
      summary: { type: Sequelize.TEXT, allowNull: true },
      createdAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') },
      updatedAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') },
    });
    await queryInterface.addIndex('financial_documents', ['userId', 'status'], {
      name: 'financial_documents_user_status_index',
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('financial_documents');
  },
};
