'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    // Agregar la columna esAdmin a la tabla Users
    await queryInterface.addColumn("users", "esAdmin", {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    });
  },

  async down (queryInterface, Sequelize) {
    /// Revertir: eliminar la columna
    await queryInterface.removeColumn("users", "esAdmin");
  }
};
