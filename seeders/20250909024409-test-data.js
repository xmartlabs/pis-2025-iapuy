"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    const now = new Date();

    // USERS
    const users = [
      {
        ci: "11111111",
        nombre: "Santiago",
        celular: "099111111",
        cuentaBancaria: "UY123456789",
        password:
          "$2a$10$Ni0Yq3F4wfUjYpIQUgF9fuHr3wSNXKE0mxvTW5WBHujUoxtCAK6N6",
        createdAt: now,
        updatedAt: now,
        deletedAt: null,
      },
      {
        ci: "22222222",
        nombre: "María",
        celular: "099222222",
        cuentaBancaria: "UY987654321",
        password:
          "$2a$10$SLtoSdasY7h.jprZng8o6.sVnKA7bdcAt20aQ.Or.I9yz4BPDExli",
        createdAt: now,
        updatedAt: now,
        deletedAt: null,
      },
      {
        ci: "33333333",
        nombre: "Carlos",
        celular: "099333333",
        cuentaBancaria: "UY111222333",
        password:
          "$2a$10$sKqGKOMy5TC3Xvd6NfNe9.yY/w6/ZF/cZLSafo6QulGBaJVvMQRC2",
        createdAt: now,
        updatedAt: now,
        deletedAt: null,
      },
    ];

    await queryInterface.bulkInsert("users", users);

    // INTERVENCIONES
    const intervenciones = [
      {
        id: "a1111111-1111-1111-1111-111111111111",
        timeStamp: new Date("2025-09-01T10:00:00Z"),
        tipo: "Educativa",
        status: "Cerrada",
        post_evaluacion: "Evaluación positiva, asistentes comprometidos",
        fotosUrls: [
          "https://example.com/photo1.jpg",
          "https://example.com/photo2.jpg",
        ],
        userId: "11111111",
        createdAt: now,
        updatedAt: now,
        deletedAt: null,
      },
      {
        id: "b2222222-2222-2222-2222-222222222222",
        timeStamp: new Date("2025-09-07T15:30:00Z"),
        tipo: "Recreativa",
        status: "Suspendida",
        post_evaluacion: null,
        fotosUrls: Sequelize.literal("ARRAY[]::text[]"),
        userId: "22222222",
        createdAt: now,
        updatedAt: now,
        deletedAt: null,
      },
    ];

    // Note: bulkInsert accepts Sequelize.literal values in the rows
    await queryInterface.bulkInsert("intervenciones", intervenciones);

    // ACOMPANIANTES (join table)
    const acompaniantes = [
      {
        userId: "33333333",
        intervencionId: "a1111111-1111-1111-1111-111111111111",
        createdAt: now,
        updatedAt: now,
        deletedAt: null,
      },
      {
        userId: "22222222",
        intervencionId: "a1111111-1111-1111-1111-111111111111",
        createdAt: now,
        updatedAt: now,
        deletedAt: null,
      },
      {
        userId: "11111111",
        intervencionId: "b2222222-2222-2222-2222-222222222222",
        createdAt: now,
        updatedAt: now,
        deletedAt: null,
      },
    ];

    await queryInterface.bulkInsert("acompaniantes", acompaniantes);
  },

  async down(queryInterface, Sequelize) {
    const Op = Sequelize.Op;

    await queryInterface.bulkDelete(
      "acompaniantes",
      {
        userId: { [Op.in]: ["11111111", "22222222", "33333333"] },
        intervencionId: {
          [Op.in]: [
            "a1111111-1111-1111-1111-111111111111",
            "b2222222-2222-2222-2222-222222222222",
          ],
        },
      },
      {}
    );

    await queryInterface.bulkDelete(
      "intervenciones",
      {
        id: {
          [Op.in]: [
            "a1111111-1111-1111-1111-111111111111",
            "b2222222-2222-2222-2222-222222222222",
          ],
        },
      },
      {}
    );

    await queryInterface.bulkDelete(
      "users",
      { ci: { [Op.in]: ["11111111", "22222222", "33333333"] } },
      {}
    );
  },
};
