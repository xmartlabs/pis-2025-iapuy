"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("expenses", "dateSanity", {
      type: Sequelize.DATE,
      allowNull: true, // puede ser null si la fecha viene de Intervention
    });
  },

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("expenses", "dateSanity");
  },
};
