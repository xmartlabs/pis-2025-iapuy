"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    await queryInterface.bulkUpdate(
      "intervenciones",
      { status: "Pendiente" },
      { timeStamp: new Date("2025-01-10T14:30:00") }
    );

    await queryInterface.bulkUpdate(
      "intervenciones",
      { status: "Finalizada" },
      { timeStamp: new Date("2025-02-05T09:00:00") }
    );

    await queryInterface.bulkUpdate(
      "intervenciones",
      { status: "Suspendida" },
      { timeStamp: new Date("2025-02-20T11:00:00") }
    );

    await queryInterface.bulkUpdate(
      "intervenciones",
      { status: "Pendiente" },
      { id: "a1111111-1111-1111-1111-111111111111" }
    );

    await queryInterface.bulkUpdate(
      "intervenciones",
      { status: "Suspendida" },
      { id: "b2222222-2222-2222-2222-222222222222" }
    );
  },

  async down(queryInterface) {
    await queryInterface.bulkUpdate(
      "intervenciones",
      { status: null },
      { timeStamp: new Date("2025-01-10T14:30:00") }
    );

    await queryInterface.bulkUpdate(
      "intervenciones",
      { status: null },
      { timeStamp: new Date("2025-02-05T09:00:00") }
    );

    await queryInterface.bulkUpdate(
      "intervenciones",
      { status: null },
      { timeStamp: new Date("2025-02-20T11:00:00") }
    );

    await queryInterface.bulkUpdate(
      "intervenciones",
      { status: null },
      { id: "a1111111-1111-1111-1111-111111111111" }
    );

    await queryInterface.bulkUpdate(
      "intervenciones",
      { status: null },
      { id: "b2222222-2222-2222-2222-222222222222" }
    );
  },
};
