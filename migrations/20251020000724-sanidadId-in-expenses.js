"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("expenses", "sanidadId", {
      type: Sequelize.UUID,
      allowNull: true,
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn("expenses", "sanidadId");
  },
};
