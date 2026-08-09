'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('document_chunks', {
      id: { type: Sequelize.UUID, allowNull: false, primaryKey: true },
      documentId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'financial_documents', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      chunkIndex: { type: Sequelize.INTEGER, allowNull: false },
      content: { type: Sequelize.TEXT, allowNull: false },
      createdAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') },
      updatedAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') },
    });
    await queryInterface.addIndex('document_chunks', ['documentId', 'chunkIndex'], {
      unique: true,
      name: 'document_chunks_document_index_unique',
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('document_chunks');
  },
};
