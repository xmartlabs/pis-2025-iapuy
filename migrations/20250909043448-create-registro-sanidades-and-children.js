"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Ensure uuid extension exists (for uuid_generate_v4)
    await queryInterface.sequelize.query(
      'CREATE EXTENSION IF NOT EXISTS "uuid-ossp";'
    );

    // Create registro-sanidades table
    await queryInterface.createTable("registro-sanidades", {
      id: {
        type: Sequelize.UUID,
        allowNull: false,
        primaryKey: true,
        defaultValue: Sequelize.literal("uuid_generate_v4()"),
      },
      perroId: {
        type: Sequelize.STRING,
        allowNull: true,
        references: {
          model: "perros",
          key: "id",
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

    // Create desparasitaciones table
    await queryInterface.createTable("desparasitaciones", {
      id: {
        type: Sequelize.UUID,
        allowNull: false,
        primaryKey: true,
        defaultValue: Sequelize.literal("uuid_generate_v4()"),
      },
      fecha: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      medicamento: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      registroSanidadId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: "registro-sanidades",
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

    // Create vacunas table
    await queryInterface.createTable("vacunas", {
      id: {
        type: Sequelize.UUID,
        allowNull: false,
        primaryKey: true,
        defaultValue: Sequelize.literal("uuid_generate_v4()"),
      },
      fecha: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      vac: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      registroSanidadId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: "registro-sanidades",
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

    // Create banios table
    await queryInterface.createTable("banios", {
      id: {
        type: Sequelize.UUID,
        allowNull: false,
        primaryKey: true,
        defaultValue: Sequelize.literal("uuid_generate_v4()"),
      },
      fecha: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      registroSanidadId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: "registro-sanidades",
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

    // Add indexes
    await queryInterface.addIndex("desparasitaciones", ["registroSanidadId"]);
    await queryInterface.addIndex("vacunas", ["registroSanidadId"]);
    await queryInterface.addIndex("banios", ["registroSanidadId"]);
    await queryInterface.addIndex("registro-sanidades", ["perroId"]);
  },

  async down(queryInterface, Sequelize) {
    // Remove indexes (best effort)
    await queryInterface
      .removeIndex("registro-sanidades", ["perroId"])
      .catch(() => {});
    await queryInterface
      .removeIndex("banios", ["registroSanidadId"])
      .catch(() => {});
    await queryInterface
      .removeIndex("vacunas", ["registroSanidadId"])
      .catch(() => {});
    await queryInterface
      .removeIndex("desparasitaciones", ["registroSanidadId"])
      .catch(() => {});

    // Drop child tables first
    await queryInterface.dropTable("banios");
    await queryInterface.dropTable("vacunas");
    await queryInterface.dropTable("desparasitaciones");

    // Then drop parent table
    await queryInterface.dropTable("registro-sanidades");
  },
};
