"use strict";

module.exports = {
  up: async (queryInterface) => {
    await queryInterface.renameTable("gastos", "expenses");
  },

  down: async (queryInterface) => {
    await queryInterface.renameTable("expenses", "gastos");
  },
};
