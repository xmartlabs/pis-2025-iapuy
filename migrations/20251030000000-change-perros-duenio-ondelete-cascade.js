"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Remove the existing foreign key constraint
    await queryInterface.removeConstraint("perros", "perros_duenioId_fkey");

    // Add the foreign key constraint with CASCADE on delete
    await queryInterface.addConstraint("perros", {
      fields: ["duenioId"],
      type: "foreign key",
      name: "perros_duenioId_fkey",
      references: {
        table: "users",
        field: "ci",
      },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    });
  },

  async down(queryInterface, Sequelize) {
    // Remove the CASCADE foreign key constraint
    await queryInterface.removeConstraint("perros", "perros_duenioId_fkey");

    // Restore the original foreign key constraint with SET NULL on delete
    await queryInterface.addConstraint("perros", {
      fields: ["duenioId"],
      type: "foreign key",
      name: "perros_duenioId_fkey",
      references: {
        table: "users",
        field: "ci",
      },
      onUpdate: "CASCADE",
      onDelete: "SET NULL",
    });
  },
};
