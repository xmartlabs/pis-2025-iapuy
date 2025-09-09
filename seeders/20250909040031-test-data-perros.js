"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Insert perros
    await queryInterface.bulkInsert("perros", [
      {
        id: "p1111111",
        nombre: "Firulais",
        descripcion: "Perro enérgico y juguetón",
        fortalezas: ["agilidad", "obediencia"],
        duenioId: "11111111", // Santiago
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      },
      {
        id: "p2222222",
        nombre: "Luna",
        descripcion: "Muy tranquila y cariñosa",
        fortalezas: ["empatía", "paciencia"],
        duenioId: "22222222", // María
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      },
      {
        id: "p3333333",
        nombre: "Rocco",
        descripcion: "Protector y atento",
        fortalezas: ["alerta", "protección"],
        duenioId: "33333333", // Carlos
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      },
    ]);

    // Insert usrperros (relations between users, perros, and intervenciones)
    await queryInterface.bulkInsert("usrperros", [
      {
        userId: "11111111", // Santiago
        perroId: "p1111111",
        intervencionId: "a1111111-1111-1111-1111-111111111111", // educativa
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      },
      {
        userId: "22222222", // María
        perroId: "p2222222",
        intervencionId: "b2222222-2222-2222-2222-222222222222", // recreativa
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      },
      {
        userId: "33333333", // Carlos
        perroId: "p3333333",
        intervencionId: "a1111111-1111-1111-1111-111111111111", // also joins educativa
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      },
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("usrperros", null, {});
    await queryInterface.bulkDelete("perros", null, {});
  },
};
