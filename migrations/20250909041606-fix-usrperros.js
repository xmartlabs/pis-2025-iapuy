// migrations/XXXX-add-id-to-usrperros.js
"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.query(
      'ALTER TABLE "usrperros" DROP CONSTRAINT IF EXISTS "usrperros_pkey";'
    );

    await queryInterface.addColumn("usrperros", "id", {
      type: Sequelize.UUID,
      allowNull: false,
      defaultValue: Sequelize.literal("uuid_generate_v4()"),
    });

    await queryInterface.sequelize.query(
      'ALTER TABLE "usrperros" ADD PRIMARY KEY ("id");'
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.sequelize.query(
      'ALTER TABLE "usrperros" DROP CONSTRAINT IF EXISTS "usrperros_pkey";'
    );
    await queryInterface.removeColumn("usrperros", "id");

    await queryInterface.sequelize.query(`
      ALTER TABLE "usrperros"
      ADD CONSTRAINT "usrperros_pkey" PRIMARY KEY ("userId","perroId","intervencionId");
    `);
  },
};
