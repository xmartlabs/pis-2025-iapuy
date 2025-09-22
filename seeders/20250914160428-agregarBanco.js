'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    await queryInterface.bulkUpdate(
      'users',
      { banco: 'Santander' },
      { ci: '11111111' }
    );

    await queryInterface.bulkUpdate(
      'users',
      { banco: 'Itaú' },
      { ci: '22222222' }
    );

    await queryInterface.bulkUpdate(
      'users',
      { banco: 'BBVA' },
      { ci: '33333333' }
    );
  },

  async down(queryInterface) {
    await queryInterface.bulkUpdate(
      'users',
      { banco: null },
      { ci: '11111111' }
    );

    await queryInterface.bulkUpdate(
      'users',
      { banco: null },
      { ci: '22222222' }
    );

    await queryInterface.bulkUpdate(
      'users',
      { banco: null },
      { ci: '33333333' }
    );
  },
};
