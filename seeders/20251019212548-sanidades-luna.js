"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    //Using Luna's existing registro-sanidad ID
    const registroSanidadId = "a2222222-2222-2222-2222-222222222222";
    const vacunas = [
      {
        id: "11111111-1111-4444-8888-aaaaaaaaaaaa",
        fecha: new Date("2025-09-01T10:00:00"),
        vac: "Vacunación inicial de Luna",
        registroSanidadId,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: "22222222-2222-4444-8888-bbbbbbbbbbbb",
        fecha: new Date("2025-10-05T14:00:00"),
        vac: "Refuerzo de vacuna",
        registroSanidadId,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: "33333333-3333-4444-8888-cccccccccccc",
        fecha: new Date("2025-10-15T10:15:00"),
        vac: "Vacunación anual",
        registroSanidadId,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    await queryInterface.bulkInsert("vacunas", vacunas);
    const desparasitaciones = [
      {
        id: "44444444-4444-4444-8888-dddddddddddd",
        fecha: new Date("2025-09-15T11:30:00"),
        medicamento: "Desparasitación oral",
        registroSanidadId,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: "55555555-5555-4444-8888-eeeeeeeeeeee",
        fecha: new Date("2025-10-12T12:00:00"),
        medicamento: "Desparasitación de seguimiento",
        registroSanidadId,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    await queryInterface.bulkInsert("desparasitaciones", desparasitaciones);
    const banios = [
      {
        id: "66666666-6666-4444-8888-ffffffffffff",
        fecha: new Date("2025-09-30T09:00:00"),
        registroSanidadId,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: "77777777-7777-4444-8888-000000000000",
        fecha: new Date("2025-10-10T08:30:00"),
        registroSanidadId,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: "88888888-8888-4444-8888-111111111111",
        fecha: new Date("2025-10-18T16:00:00"),
        registroSanidadId,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    await queryInterface.bulkInsert("banios", banios);
  },

  async down(queryInterface, Sequelize) {
    const vacunaIds = [
      "11111111-1111-4444-8888-aaaaaaaaaaaa",
      "22222222-2222-4444-8888-bbbbbbbbbbbb",
      "33333333-3333-4444-8888-cccccccccccc",
    ];

    const desparasitacionIds = [
      "44444444-4444-4444-8888-dddddddddddd",
      "55555555-5555-4444-8888-eeeeeeeeeeee",
    ];

    const banioIds = [
      "66666666-6666-4444-8888-ffffffffffff",
      "77777777-7777-4444-8888-000000000000",
      "88888888-8888-4444-8888-111111111111",
    ];
    await queryInterface.bulkDelete(
      "vacunas",
      { id: { [Sequelize.Op.in]: vacunaIds } },
      {}
    );

    await queryInterface.bulkDelete(
      "desparasitaciones",
      { id: { [Sequelize.Op.in]: desparasitacionIds } },
      {}
    );

    await queryInterface.bulkDelete(
      "banios",
      { id: { [Sequelize.Op.in]: banioIds } },
      {}
    );
  },
};
