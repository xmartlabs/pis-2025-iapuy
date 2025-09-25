'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.changeColumn('banios', 'fecha', {
      type: Sequelize.DATEONLY,
      allowNull: false,
    });

    await queryInterface.changeColumn('desparasitaciones', 'fecha', {
      type: Sequelize.DATEONLY,
      allowNull: false,
    });

    await queryInterface.changeColumn('vacunas', 'fecha', {
      type: Sequelize.DATEONLY,
      allowNull: false,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.changeColumn('banios', 'fecha', {
      type: Sequelize.DATE,
      allowNull: false,
    });

    await queryInterface.changeColumn('desparasitaciones', 'fecha', {
      type: Sequelize.DATE,
      allowNull: false,
    });

    await queryInterface.changeColumn('vacunas', 'fecha', {
      type: Sequelize.DATE,
      allowNull: false,
    });
  }
};
