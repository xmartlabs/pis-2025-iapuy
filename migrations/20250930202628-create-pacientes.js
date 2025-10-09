'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('pacientes', {
      id: {
        type: Sequelize.STRING,
        allowNull: false,
        primaryKey: true,
        defaultValue: Sequelize.literal("uuid_generate_v4()"),
      },
      nombre: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      edad: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      patologia_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'patologias',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      intervencion_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'intervenciones',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      experiencia: {
        // eslint-disable-next-line new-cap
        type: Sequelize.ENUM('buena', 'mala', 'regular'),
        allowNull: false,
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("NOW()"),
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("NOW()"),
      },
      deletedAt: {
        type: Sequelize.DATE,
        allowNull: true,
      },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('pacientes');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_pacientes_experiencia";');
  },
};
