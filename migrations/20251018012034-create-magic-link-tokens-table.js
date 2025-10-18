"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("reset_tokens", {
      userId: {
        type: Sequelize.STRING,
        allowNull: false,
        references: {
          model: "users",
          key: "ci",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      tokenHash: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
      },
      expiresAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      used: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
      deletedAt: {
        type: Sequelize.DATE,
        allowNull: true,
        defaultValue: null,
      },
    });
    // opcional: agregar un índice sobre expiresAt o userId
    await queryInterface.addIndex("reset_tokens", ["userId"]);
    await queryInterface.addIndex("reset_tokens", ["expiresAt"]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("reset_tokens");
  },
};
