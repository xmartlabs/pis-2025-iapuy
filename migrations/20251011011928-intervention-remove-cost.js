"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    await queryInterface.removeColumn("intervenciones", "costo");
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.addColumn("intervenciones", "costo", {
      type: Sequelize.FLOAT,
      allowNull: true,
    });
  },
};
