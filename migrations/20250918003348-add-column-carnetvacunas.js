'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('vacunas', 'carneVacunas', {
      type: Sequelize.BLOB('long'),
      allowNull: true
    });
  },

  async down (queryInterface) {
    await queryInterface.removeColumn('vacunas', 'carneVacunas');
  }
};
