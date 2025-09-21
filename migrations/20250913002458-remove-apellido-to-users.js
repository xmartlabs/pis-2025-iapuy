'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    /// Revertir: eliminar la columna
    await queryInterface.removeColumn("users", "apellido");
  },

  async down (queryInterface, Sequelize) {
    // Agregar la columna esAdmin a la tabla Users
    await queryInterface.addColumn("users", "apellido", {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: false,
    });
  }
};
