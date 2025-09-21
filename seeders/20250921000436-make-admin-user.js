"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    await queryInterface.bulkUpdate(
      "users",
      { esAdmin: true },
      { ci: "11111111" }
    );
  },

  async down(queryInterface) {
    await queryInterface.bulkUpdate(
      "users",
      { esAdmin: false },
      { ci: "11111111" }
    );
  },
};
