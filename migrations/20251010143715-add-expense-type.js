"use strict";

/* eslint-disable new-cap */

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("expenses", "type", {
      type: Sequelize.ENUM(
        "Baño",
        "Estacionamiento/Taxi",
        "Traslado",
        "Vacunacion",
        "Desparasitacion Interna",
        "Desparasitacion Externa",
        "Pago a acompañante",
        "Pago a guía"
      ),
      allowNull: false,
      defaultValue: "Pago a acompañante",
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn("expenses", "type");

    await queryInterface.sequelize.query(
      'DROP TYPE IF EXISTS "enum_expenses_type";'
    );
  },
};
