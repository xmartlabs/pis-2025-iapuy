"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    await queryInterface.renameColumn("expenses", "monto", "amount");
    await queryInterface.renameColumn("expenses", "estado", "state");
    await queryInterface.renameColumn(
      "expenses",
      "intervencionId",
      "interventionId"
    );
    await queryInterface.renameColumn("expenses", "concepto", "concept");
  },

  async down(queryInterface) {
    await queryInterface.renameColumn("expenses", "amount", "monto");
    await queryInterface.renameColumn("expenses", "state", "estado");
    await queryInterface.renameColumn(
      "expenses",
      "interventionId",
      "intervencionId"
    );
    await queryInterface.renameColumn("expenses", "concept", "concepto");
  },
};
