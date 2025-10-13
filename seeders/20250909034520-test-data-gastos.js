"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert("expenses", [
      {
        id: "a1111111-1111-1111-1111-111111111111",
        userId: "11111111", // Santiago
        interventionId: "a1111111-1111-1111-1111-111111111111", // educativa
        concept: "Compra de materiales educativos",
        state: "pagado",
        amount: 1500.5,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      },
      {
        id: "a2222222-2222-2222-2222-222222222222",
        userId: "22222222", // María
        interventionId: "b2222222-2222-2222-2222-222222222222", // recreativa
        concept: "Snacks y bebidas recreativas",
        state: "no pagado",
        amount: 200.0,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      },
      {
        id: "a3333333-3333-3333-3333-333333333333",
        userId: "11111111", // Santiago
        interventionId: "a1111111-1111-1111-1111-111111111111",
        concept: "Transporte para asistentes",
        state: "pagado",
        amount: 500.0,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      },
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("expenses", null, {});
  },
};
