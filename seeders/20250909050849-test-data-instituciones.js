"use strict";
const { v4: uuidv4 } = require("uuid");

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    // Create instituciones
    const inst1 = uuidv4();
    const inst2 = uuidv4();

    await queryInterface.bulkInsert("instituciones", [
      {
        id: inst1,
        nombre: "Centro Educativo Los Andes",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: inst2,
        nombre: "Fundación Recrear",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);

    await queryInterface.bulkInsert("institutionContacts", [
      {
        name: "María Gómez",
        contact: "099123456",
        institutionId: inst1,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: "Juan Pérez",
        contact: "092987654",
        institutionId: inst2,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);

    // Create patologias
    const pat1 = uuidv4();
    const pat2 = uuidv4();
    const pat3 = uuidv4();

    await queryInterface.bulkInsert("patologias", [
      {
        id: pat1,
        nombre: "Ansiedad",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: pat2,
        nombre: "Estrés",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: pat3,
        nombre: "Depresión",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);

    // Create intervenciones
    const int1 = uuidv4();
    const int2 = uuidv4();
    const int3 = uuidv4();

    await queryInterface.bulkInsert("intervenciones", [
      {
        id: int1,
        timeStamp: new Date("2025-01-10T14:30:00"),
        costo: 1200,
        tipo: "Educativa",
        post_evaluacion: "Mejor concentración en clase",
        fotosUrls: ["foto1.jpg", "foto2.jpg"], // Postgres array
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: int2,
        timeStamp: new Date("2025-02-05T09:00:00"),
        costo: 800,
        tipo: "Recreativa",
        post_evaluacion: "Mayor interacción social",
        fotosUrls: ["foto3.jpg"],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: int3,
        timeStamp: new Date("2025-02-20T11:00:00"),
        costo: 1500,
        tipo: "Terapeutica",
        post_evaluacion: "Reducción de síntomas de ansiedad",
        fotosUrls: ["foto4.jpg", "foto5.jpg", "foto6.jpg"],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);

    // Join table: institucion-patologias
    await queryInterface.bulkInsert("institucion-patologias", [
      {
        institucionId: inst1,
        patologiaId: pat1,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        institucionId: inst1,
        patologiaId: pat2,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        institucionId: inst2,
        patologiaId: pat3,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);

    // Join table: institucion-intervenciones
    await queryInterface.bulkInsert("institucion-intervenciones", [
      {
        institucionId: inst1,
        intervencionId: int1,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        institucionId: inst2,
        intervencionId: int2,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        institucionId: inst2,
        intervencionId: int3,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);

    // Insert usrperros (relations between users, perros, and intervenciones)
    await queryInterface.bulkInsert("usrperros", [
      {
        userId: "11111111", // Santiago
        perroId: "p1111111",
        intervencionId: int1,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      },
      {
        userId: "22222222", // María
        perroId: "p2222222",
        intervencionId: int2,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      },
      {
        userId: "33333333", // Carlos
        perroId: "p3333333",
        intervencionId: int3,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      },
    ]);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete("institucion-intervenciones", null, {});
    await queryInterface.bulkDelete("institucion-patologias", null, {});
    await queryInterface.bulkDelete("intervenciones", null, {});
    await queryInterface.bulkDelete("patologias", null, {});
    await queryInterface.bulkDelete("instituciones", null, {});
    await queryInterface.bulkDelete("usrperros", null, {});
  },
};
