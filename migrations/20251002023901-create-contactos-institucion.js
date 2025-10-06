'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable("institutionContacts", {
      id: {
        type: Sequelize.UUID,
        allowNull: false,
        primaryKey: true,
        defaultValue: Sequelize.literal("uuid_generate_v4()"),
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      contact: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      institutionId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: "instituciones",
          key: "id",
        },
        onDelete: "CASCADE",
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      deletedAt: {
        type: Sequelize.DATE,
        allowNull: true,
      },
    });
    await queryInterface.removeColumn("instituciones", "contacto");
    await queryInterface.removeColumn("instituciones", "telefono");
    //
  },

  async down (queryInterface, Sequelize) {

    await queryInterface.addColumn("instituciones", "contacto", {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: false,
    });
    await queryInterface.addColumn("instituciones", "telefono", {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: false,
    });
    await queryInterface.dropTable("InstitutionContacts");
  }
};
