'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('perros-experiencias', {
      id: {
        type: Sequelize.STRING,
        allowNull: false,
        primaryKey: true,
        defaultValue: Sequelize.literal("uuid_generate_v4()"),
      },
      perro_id: {
        type: Sequelize.STRING,
        allowNull: true,
        references: {
          model: 'perros',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
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
    await queryInterface.dropTable('perros-experiencias');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_perros-experiencias_experiencia";');
  },
};
