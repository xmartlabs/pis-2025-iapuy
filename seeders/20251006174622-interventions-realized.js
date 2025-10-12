"use strict";
const { v4: uuidv4 } = require("uuid");

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Create instituciones
    const inst2 = uuidv4();

    await queryInterface.bulkInsert("instituciones", [
      {
        id: inst2,
        nombre: "Fundación 123",
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
        nombre: "Patolgy 11",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: pat2,
        nombre: "Patolgy 22",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: pat3,
        nombre: "Patolgy 33",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);

    // Create intervenciones
    const int3 = uuidv4();
    const int4 = uuidv4();

    await queryInterface.bulkInsert("intervenciones", [
      {
        id: int3,
        timeStamp: new Date("2026-02-20T11:00:00"),
        tipo: "terapeutica",
        post_evaluacion: "PostEval",
        //fotosUrls: ["foto4.jpg", "foto5.jpg", "foto6.jpg"],
        createdAt: new Date(),
        updatedAt: new Date(),
        status: "Realizada",
      },
      {
        id: int4,
        timeStamp: new Date("2027-02-20T11:00:00"),
        tipo: "recreativa",
        post_evaluacion: "PostEval2",
        //fotosUrls: ["foto4.jpg", "foto5.jpg", "foto6.jpg"],
        createdAt: new Date(),
        updatedAt: new Date(),
        status: "Realizada",
      },
    ]);

    // Join table: institucion-patologias
    await queryInterface.bulkInsert("institucion-patologias", [
      {
        institucionId: inst2,
        patologiaId: pat1,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        institucionId: inst2,
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

    //duplas
    const perro1 = uuidv4();
    const perro2 = uuidv4();
    const user1 = "55605124";
    const user2 = "54905123";

    await queryInterface.bulkInsert("users", [
      {
        nombre: "Marcos",
        ci: user1,
        celular: "099687442",
        banco: "Banco 1",
        cuentaBancaria: "123-456-123",
        password: "defaultpassword",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        nombre: "Miguel",
        ci: user2,
        celular: "091788354",
        banco: "Banco 2",
        cuentaBancaria: "123-654-321",
        password: "defaultpassword",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);

    await queryInterface.bulkInsert("perros", [
      {
        id: perro1,
        nombre: "Lola",
        descripcion: "Perra",
        fortalezas: "fuerte",
        duenioId: user1,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: perro2,
        nombre: "Jorgito",
        descripcion: "Perro",
        fortalezas: "fuerte",
        duenioId: user2,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);

    await queryInterface.bulkInsert("usrperros", [
      {
        userId: user1,
        perroId: perro1,
        intervencionId: int3,
        createdAt: new Date(),
        updatedAt: new Date(),
        id: uuidv4(),
      },
      {
        userId: user2,
        perroId: perro2,
        intervencionId: int3,
        createdAt: new Date(),
        updatedAt: new Date(),
        id: uuidv4(),
      },
    ]);

    //duplas
    const perro11 = uuidv4();
    const perro22 = uuidv4();
    const user11 = "55602224";
    const user22 = "54922123";

    await queryInterface.bulkInsert("users", [
      {
        nombre: "Juliana",
        ci: user11,
        celular: "029687442",
        banco: "Banco 1",
        cuentaBancaria: "123-456-123",
        password: "defaultpassword",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        nombre: "Mirta",
        ci: user22,
        celular: "091782354",
        banco: "Banco 2",
        cuentaBancaria: "123-654-321",
        password: "defaultpassword",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);

    await queryInterface.bulkInsert("perros", [
      {
        id: perro11,
        nombre: "Juana",
        descripcion: "Perra",
        fortalezas: "fuerte",
        duenioId: user11,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: perro22,
        nombre: "Zeus",
        descripcion: "Perro",
        fortalezas: "fuerte",
        duenioId: user22,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);

    await queryInterface.bulkInsert("usrperros", [
      {
        userId: user11,
        perroId: perro11,
        intervencionId: int3,
        createdAt: new Date(),
        updatedAt: new Date(),
        id: uuidv4(),
      },
      {
        userId: user22,
        perroId: perro22,
        intervencionId: int4,
        createdAt: new Date(),
        updatedAt: new Date(),
        id: uuidv4(),
      },
    ]);

    // Join table: institucion-intervenciones
    await queryInterface.bulkInsert("institucion-intervenciones", [
      {
        institucionId: inst2,
        intervencionId: int3,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        institucionId: inst2,
        intervencionId: int4,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("institucion-intervenciones", null, {});
    await queryInterface.bulkDelete("institucion-patologias", null, {});
    await queryInterface.bulkDelete("intervenciones", null, {});
    await queryInterface.bulkDelete("patologias", null, {});
    await queryInterface.bulkDelete("instituciones", null, {});
    await queryInterface.bulkDelete("usrperros", null, {});
    await queryInterface.bulkDelete("perros", null, {});
    await queryInterface.bulkDelete("users", null, {});
  },
};
