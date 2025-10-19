"use strict";
const { link } = require("fs");
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
        tipo: "Educativa",
        post_evaluacion: "Mejor concentración en clase",
        fotosUrls: [
          "https://cdn.sanity.io/images/5vm5yn1d/pro/5cb1f9400891d9da5a4926d7814bd1b89127ecba-1300x867.jpg?fm=webp&q=80",
          "https://encrypted-tbn3.gstatic.com/images?q=tbn:ANd9GcRh_iVqWXuzxtaXQT2o0LLHPIBySJkmZWa-sAUEkHISi6Raz0p4vpCuLdcQOB1VM9Z4H85_vrPfANy8gywwKxrpHtOJTu4YXdjzw_FKWdYS2A",
        ],
        driveLink:
          "https://drive.google.com/drive/folders/1A2B3C4D5E6F7G8H9I0J",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: int2,
        timeStamp: new Date("2025-02-05T09:00:00"),
        tipo: "Recreativa",
        post_evaluacion: "Mayor interacción social",
        fotosUrls: [
          "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQewsCM7TcI9FMRi00MoznAFwUeLxgm1R_oXg&s",
        ],
        driveLink: "",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: int3,
        timeStamp: new Date("2025-02-20T11:00:00"),
        tipo: "Terapeutica",
        post_evaluacion: "Reducción de síntomas de ansiedad",
        fotosUrls: [
          "https://purina.com.uy/sites/default/files/2024-04/razas-de-perros-pequenos-bichon-frise-hn.jpg",
          "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSfCOLkdK_Jpr8Yl-v-pQQjlVHzGu3D2MT7GA&s",
        ],
        driveLink: "",
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

    // Insert pacientes para cada intervención
    await queryInterface.bulkInsert("pacientes", [
      {
        id: uuidv4(),
        nombre: "Lucía Fernández",
        edad: "12",
        patologia_id: pat1,
        intervencion_id: int1,
        experiencia: "buena",
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      },
      {
        id: uuidv4(),
        nombre: "Martín López",
        edad: "13",
        patologia_id: pat2,
        intervencion_id: int1,
        experiencia: "regular",
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      },
      {
        id: uuidv4(),
        nombre: "Ana Torres",
        edad: "11",
        patologia_id: pat3,
        intervencion_id: int2,
        experiencia: "buena",
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      },
      {
        id: uuidv4(),
        nombre: "Pedro Ramírez",
        edad: "14",
        patologia_id: pat3,
        intervencion_id: int3,
        experiencia: "mala",
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      },
    ]);

    // Insert PerroExperiencia para cada intervención/perro
    await queryInterface.bulkInsert("perros-experiencias", [
      {
        id: uuidv4(),
        perro_id: "p1111111",
        intervencion_id: int1,
        experiencia: "buena",
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      },
      {
        id: uuidv4(),
        perro_id: "p2222222",
        intervencion_id: int2,
        experiencia: "regular",
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      },
      {
        id: uuidv4(),
        perro_id: "p3333333",
        intervencion_id: int3,
        experiencia: "mala",
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      },
    ]);

    // Insert acompañantes para cada intervención
    await queryInterface.bulkInsert("acompaniantes", [
      {
        userId: "11111111",
        intervencionId: int1,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      },
      {
        userId: "11111111",
        intervencionId: int2,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      },
      {
        userId: "22222222",
        intervencionId: int3,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      },
    ]);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete("acompaniantes", null, {});
    await queryInterface.bulkDelete("perros-experiencias", null, {});
    await queryInterface.bulkDelete("institucion-intervenciones", null, {});
    await queryInterface.bulkDelete("institucion-patologias", null, {});
    await queryInterface.bulkDelete("intervenciones", null, {});
    await queryInterface.bulkDelete("patologias", null, {});
    await queryInterface.bulkDelete("instituciones", null, {});
    await queryInterface.bulkDelete("usrperros", null, {});
    await queryInterface.bulkDelete("pacientes", null, {});
  },
};
