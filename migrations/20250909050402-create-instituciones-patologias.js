"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Table: instituciones
    await queryInterface.createTable("instituciones", {
      id: {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.literal("uuid_generate_v4()"),
      },
      nombre: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      contacto: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      telefono: {
        type: Sequelize.STRING,
        allowNull: false,
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
      },
    });

    // Table: patologias
    await queryInterface.createTable("patologias", {
      id: {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.literal("uuid_generate_v4()"),
      },
      nombre: {
        type: Sequelize.STRING,
        allowNull: false,
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
      },
    });

    // Table: intervenciones
    await queryInterface.createTable("intervenciones", {
      id: {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.literal("uuid_generate_v4()"),
      },
      timeStamp: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      costo: {
        type: Sequelize.FLOAT,
        allowNull: false,
      },
      tipo: {
        type: Sequelize.ENUM("educativa", "recreativa", "terapeutica"),
        allowNull: false,
      },
      post_evaluacion: {
        type: Sequelize.STRING,
      },
      fotosUrls: {
        type: Sequelize.ARRAY(Sequelize.STRING),
        allowNull: false,
        defaultValue: [],
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
      },
    });

    // Table: institucion-patologias (Join table)
    await queryInterface.createTable("institucion-patologias", {
      institucionId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: "instituciones",
          key: "id",
        },
        onDelete: "CASCADE",
      },
      patologiaId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: "patologias",
          key: "id",
        },
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
      },
    });

    // Table: institucion-intervenciones (Join table)
    await queryInterface.createTable("institucion-intervenciones", {
      institucionId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: "instituciones",
          key: "id",
        },
        onDelete: "CASCADE",
      },
      intervencionId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: "intervenciones",
          key: "id",
        },
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
      },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("institucion-intervenciones");
    await queryInterface.dropTable("institucion-patologias");
    await queryInterface.dropTable("intervenciones");
    await queryInterface.dropTable("patologias");
    await queryInterface.dropTable("instituciones");
  },
};
