"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const now = new Date();

    // Fetch a couple of perros to attach registro-sanidades
    const [perros] = await queryInterface.sequelize.query(
      `SELECT id FROM "perros" LIMIT 2;`
    );

    if (!perros.length) {
      throw new Error("No perros found. Please seed perros first.");
    }

    // RegistroSanidad entries
    await queryInterface.bulkInsert("registro-sanidades", [
      {
        id: "a1111111-1111-1111-1111-111111111111",
        perroId: perros[0].id,
        createdAt: now,
        updatedAt: now,
        deletedAt: null,
      },
      {
        id: "a2222222-2222-2222-2222-222222222222",
        perroId: perros[1].id,
        createdAt: now,
        updatedAt: now,
        deletedAt: null,
      },
    ]);

    // Banios
    await queryInterface.bulkInsert("banios", [
      {
        id: "b1111111-1111-1111-1111-111111111111",
        fecha: new Date("2025-08-15"),
        registroSanidadId: "a1111111-1111-1111-1111-111111111111",
        createdAt: now,
        updatedAt: now,
        deletedAt: null,
      },
      {
        id: "b2222222-2222-2222-2222-222222222222",
        fecha: new Date("2025-08-20"),
        registroSanidadId: "a2222222-2222-2222-2222-222222222222",
        createdAt: now,
        updatedAt: now,
        deletedAt: null,
      },
    ]);

    // Vacunas
    await queryInterface.bulkInsert("vacunas", [
      {
        id: "a1111111-1111-1111-1111-111111111111",
        fecha: new Date("2025-07-01"),
        vac: "Rabia",
        registroSanidadId: "a1111111-1111-1111-1111-111111111111",
        createdAt: now,
        updatedAt: now,
        deletedAt: null,
      },
      {
        id: "a2322222-2222-2222-2222-222222222222",
        fecha: new Date("2025-07-10"),
        vac: "Moquillo",
        registroSanidadId: "a2222222-2222-2222-2222-222222222222",
        createdAt: now,
        updatedAt: now,
        deletedAt: null,
      },
    ]);

    // Desparasitaciones
    await queryInterface.bulkInsert("desparasitaciones", [
      {
        id: "d1111111-1111-1111-1111-111111111111",
        fecha: new Date("2025-06-01"),
        medicamento: "Ivermectina",
        registroSanidadId: "a1111111-1111-1111-1111-111111111111",
        createdAt: now,
        updatedAt: now,
        deletedAt: null,
      },
      {
        id: "d2222222-2222-2222-2222-222222222222",
        fecha: new Date("2025-06-05"),
        medicamento: "Albendazol",
        registroSanidadId: "a2222222-2222-2222-2222-222222222222",
        createdAt: now,
        updatedAt: now,
        deletedAt: null,
      },
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("desparasitaciones", null, {});
    await queryInterface.bulkDelete("vacunas", null, {});
    await queryInterface.bulkDelete("banios", null, {});
    await queryInterface.bulkDelete("registro-sanidades", null, {});
  },
};
