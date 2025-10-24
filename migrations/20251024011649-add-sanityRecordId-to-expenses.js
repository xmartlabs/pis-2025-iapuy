"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("expenses", "sanityRecordId", {
      type: Sequelize.UUID,
      allowNull: true,
      references: {
        model: "registro-sanidades",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "SET NULL",
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn("expenses", "sanityRecordId");
  },
};
