'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn({ tableName:'desparasitaciones',schema:'public'}, 
      'tipoDesparasitacion',
      {
        type: Sequelize.ENUM('Externa', 'Interna'),
        allowNull: false,
        defaultValue: 'Externa'
      }
    );
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn(
      { tableName: 'desparasitaciones', schema: 'public' },
      'tipoDesparasitacion'
    );
    await queryInterface.sequelize.query(
      'DROP TYPE IF EXISTS "enum_desparasitaciones_tipoDesparasitacion";'
    );
  }
};

