"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert("gastos", [
      {
        id: "a1111111-1111-1111-1111-111111111111",
        userId: "11111111", // Santiago
        intervencionId: "a1111111-1111-1111-1111-111111111111", // educativa
        concepto: "Compra de materiales educativos",
        estado: "pagado",
        monto: 1500.5,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      },
      {
        id: "a2222222-2222-2222-2222-222222222222",
        userId: "22222222", // María
        intervencionId: "b2222222-2222-2222-2222-222222222222", // recreativa
        concepto: "Snacks y bebidas recreativas",
        estado: "no pagado",
        monto: 200.0,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      },
      {
        id: "a3333333-3333-3333-3333-333333333333",
        userId: "11111111", // Santiago
        intervencionId: "a1111111-1111-1111-1111-111111111111",
        concepto: "Transporte para asistentes",
        estado: "pagado",
        monto: 500.0,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      },
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("gastos", null, {});
  },
};
