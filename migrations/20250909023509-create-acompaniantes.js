"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    // Create join table 'acompaniantes' (composite PK: userId + intervencionId)
    await queryInterface.createTable("acompaniantes", {
      userId: {
        type: Sequelize.STRING,
        allowNull: false,
        primaryKey: true,
        references: {
          model: "users",
          key: "ci",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      intervencionId: {
        type: Sequelize.UUID,
        allowNull: false,
        primaryKey: true,
        references: {
          model: "intervenciones",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },

      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("NOW()"),
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("NOW()"),
      },
      deletedAt: {
        type: Sequelize.DATE,
        allowNull: true,
      },
    });

    // Add an index to speed up lookups by user or by intervencion
    await queryInterface.addIndex("acompaniantes", ["userId"]);
    await queryInterface.addIndex("acompaniantes", ["intervencionId"]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface
      .removeIndex("acompaniantes", ["intervencionId"])
      .catch(() => {});
    await queryInterface
      .removeIndex("acompaniantes", ["userId"])
      .catch(() => {});
    await queryInterface.dropTable("acompaniantes");
  },
};
