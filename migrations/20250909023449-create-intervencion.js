"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    // Ensure uuid extension exists (for uuid_generate_v4)
    await queryInterface.sequelize.query(
      'CREATE EXTENSION IF NOT EXISTS "uuid-ossp";'
    );

    // Create table 'intervenciones'
    await queryInterface.createTable("intervenciones", {
      id: {
        type: Sequelize.UUID,
        allowNull: false,
        primaryKey: true,
        defaultValue: Sequelize.literal("uuid_generate_v4()"),
      },
      timeStamp: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      costo: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
      },
      tipo: {
        type: Sequelize.ENUM("educativa", "recreativa", "terapeutica"),
        allowNull: false,
      },
      post_evaluacion: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      fotosUrls: {
        type: Sequelize.ARRAY(Sequelize.TEXT),
        allowNull: false,
        defaultValue: [],
      },
      userId: {
        type: Sequelize.STRING,
        allowNull: true,
        references: {
          model: "users",
          key: "ci",
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
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
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("intervenciones");

    await queryInterface.sequelize.query(
      'DROP TYPE IF EXISTS "enum_intervenciones_tipo";'
    );
  },
};
