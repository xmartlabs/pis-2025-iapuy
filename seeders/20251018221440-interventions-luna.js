"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Use fixed UUIDs so we can reference them in the down function
    const lunaInt1 = "11111111-1111-4444-8888-111111111111";
    const lunaInt2 = "22222222-2222-4444-8888-222222222222";
    const lunaInt3 = "33333333-3333-4444-8888-333333333333";
    const lunaInt4 = "44444444-4444-4444-8888-444444444444";
    const lunaInt5 = "55555555-5555-4444-8888-555555555555";
    const lunaInt6 = "66666666-6666-4444-8888-666666666666";
    const lunaInt7 = "77777777-7777-4444-8888-777777777777";
    const lunaInt8 = "88888888-8888-4444-8888-888888888888";

    // Fixed institution IDs for associations
    const instEducativa = "aaaa1111-bbbb-4444-cccc-ddddeeeeeeee";
    const instRecreatva = "bbbb2222-cccc-4444-dddd-eeeeffffffff";

    // Create institutions if they don't exist
    await queryInterface.bulkInsert("instituciones", [
      {
        id: instEducativa,
        nombre: "Instituto Educativo Luna",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: instRecreatva,
        nombre: "Centro Recreativo Esperanza",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);

    // Create 8 interventions for Luna (perroId: p2222222) with status not 'pendiente'
    const interventions = [
      {
        id: lunaInt5,
        timeStamp: new Date("2025-10-18T10:00:00"),
        tipo: "Educativa",
        status: "Realizada",
        pairsQuantity: 2,
        description: "Tercera intervención educativa con Luna",
        fotosUrls: Sequelize.literal("ARRAY[]::text[]"),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: lunaInt6,
        timeStamp: new Date("2025-10-20T11:00:00"),
        tipo: "Recreativa",
        status: "Realizada",
        pairsQuantity: 3,
        description: "Segunda intervención recreativa con Luna",
        fotosUrls: Sequelize.literal("ARRAY[]::text[]"),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: lunaInt7,
        timeStamp: new Date("2025-10-22T09:30:00"),
        tipo: "Terapeutica",
        status: "Cancelada",
        pairsQuantity: 1,
        description: "Segunda intervención terapéutica con Luna",
        fotosUrls: Sequelize.literal("ARRAY[]::text[]"),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: lunaInt8,
        timeStamp: new Date("2025-10-25T14:00:00"),
        tipo: "Educativa",
        status: "Realizada",
        pairsQuantity: 2,
        description: "Cuarta intervención educativa con Luna",
        fotosUrls: Sequelize.literal("ARRAY[]::text[]"),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: lunaInt1,
        timeStamp: new Date("2025-10-01T10:00:00"),
        tipo: "Educativa",
        status: "Realizada",
        pairsQuantity: 2,
        description: "Intervención educativa con Luna",
        fotosUrls: Sequelize.literal("ARRAY[]::text[]"),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: lunaInt2,
        timeStamp: new Date("2025-10-05T11:00:00"),
        tipo: "Recreativa",
        status: "Realizada",
        pairsQuantity: 3,
        description: "Intervención recreativa con Luna",
        fotosUrls: Sequelize.literal("ARRAY[]::text[]"),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: lunaInt3,
        timeStamp: new Date("2025-10-10T09:30:00"),
        tipo: "Terapeutica",
        status: "Cancelada",
        pairsQuantity: 1,
        description: "Intervención terapéutica con Luna",
        fotosUrls: Sequelize.literal("ARRAY[]::text[]"),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: lunaInt4,
        timeStamp: new Date("2025-10-15T14:00:00"),
        tipo: "Educativa",
        status: "Realizada",
        pairsQuantity: 2,
        description: "Segunda intervención educativa con Luna",
        fotosUrls: Sequelize.literal("ARRAY[]::text[]"),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    await queryInterface.bulkInsert("intervenciones", interventions);

    // Link Luna to these interventions in usrperros
    const lunaUsrPerros = interventions.map((intv) => ({
      userId: "22222222", // María
      perroId: "p2222222",
      intervencionId: intv.id,
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
    }));
    await queryInterface.bulkInsert("usrperros", lunaUsrPerros);

    // Link interventions to institutions
    const institutionInterventions = [
      // Educational interventions with Educational Institute
      {
        institucionId: instEducativa,
        intervencionId: lunaInt1,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        institucionId: instEducativa,
        intervencionId: lunaInt4,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        institucionId: instEducativa,
        intervencionId: lunaInt5,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        institucionId: instEducativa,
        intervencionId: lunaInt8,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      // Recreational interventions with Recreational Center
      {
        institucionId: instRecreatva,
        intervencionId: lunaInt2,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        institucionId: instRecreatva,
        intervencionId: lunaInt6,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      // Therapeutic interventions with Educational Institute
      {
        institucionId: instEducativa,
        intervencionId: lunaInt3,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        institucionId: instEducativa,
        intervencionId: lunaInt7,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    await queryInterface.bulkInsert(
      "institucion-intervenciones",
      institutionInterventions
    );
  },

  async down(queryInterface) {
    // Delete institution-intervention associations first
    await queryInterface.bulkDelete("institucion-intervenciones", {
      intervencionId: [
        "11111111-1111-4444-8888-111111111111",
        "22222222-2222-4444-8888-222222222222",
        "33333333-3333-4444-8888-333333333333",
        "44444444-4444-4444-8888-444444444444",
        "55555555-5555-4444-8888-555555555555",
        "66666666-6666-4444-8888-666666666666",
        "77777777-7777-4444-8888-777777777777",
        "88888888-8888-4444-8888-888888888888",
      ],
    });

    // Delete only the specific usrperros entries for these interventions
    await queryInterface.bulkDelete("usrperros", {
      intervencionId: [
        "11111111-1111-4444-8888-111111111111",
        "22222222-2222-4444-8888-222222222222",
        "33333333-3333-4444-8888-333333333333",
        "44444444-4444-4444-8888-444444444444",
        "55555555-5555-4444-8888-555555555555",
        "66666666-6666-4444-8888-666666666666",
        "77777777-7777-4444-8888-777777777777",
        "88888888-8888-4444-8888-888888888888",
      ],
    });

    // Delete only the specific interventions created by this seed
    await queryInterface.bulkDelete("intervenciones", {
      id: [
        "11111111-1111-4444-8888-111111111111",
        "22222222-2222-4444-8888-222222222222",
        "33333333-3333-4444-8888-333333333333",
        "44444444-4444-4444-8888-444444444444",
        "55555555-5555-4444-8888-555555555555",
        "66666666-6666-4444-8888-666666666666",
        "77777777-7777-4444-8888-777777777777",
        "88888888-8888-4444-8888-888888888888",
      ],
    });

    // Delete the institutions created by this seed
    await queryInterface.bulkDelete("instituciones", {
      id: [
        "aaaa1111-bbbb-4444-cccc-ddddeeeeeeee",
        "bbbb2222-cccc-4444-dddd-eeeeffffffff",
      ],
    });
  },
};
