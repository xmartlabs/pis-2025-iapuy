/* eslint-disable no-await-in-loop */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const enumValuesToAdd = ['Educativa', 'Recreativa', 'Terapeutica'];
    for (const value of enumValuesToAdd) {
      await queryInterface.sequelize.query(`
        DO $$
        BEGIN
          IF NOT EXISTS (
            SELECT 1
            FROM pg_enum e
            JOIN pg_type t ON e.enumtypid = t.oid
            WHERE t.typname = 'enum_intervenciones_tipo'
              AND e.enumlabel = '${value}'
          ) THEN
            ALTER TYPE "enum_intervenciones_tipo" ADD VALUE '${value}';
          END IF;
        END
        $$;
      `);
    }

    await queryInterface.sequelize.query(`
      UPDATE "intervenciones"
      SET "tipo" = CASE "tipo"
        WHEN 'educativa' THEN 'Educativa'
        WHEN 'recreativa' THEN 'Recreativa'
        WHEN 'terapeutica' THEN 'Terapeutica'
        ELSE "tipo"
      END;
    `);

    await queryInterface.sequelize.query(`
      DROP TYPE IF EXISTS "enum_intervenciones_tipo_tmp";
      CREATE TYPE "enum_intervenciones_tipo_tmp" AS ENUM ('Educativa', 'Recreativa', 'Terapeutica');
    `);

    await queryInterface.sequelize.query(`
      ALTER TABLE "intervenciones"
      ALTER COLUMN "tipo" TYPE "enum_intervenciones_tipo_tmp"
      USING "tipo"::text::enum_intervenciones_tipo_tmp;
    `);

    await queryInterface.sequelize.query(`
      DROP TYPE IF EXISTS "enum_intervenciones_tipo";
    `);

    await queryInterface.sequelize.query(`
      ALTER TYPE "enum_intervenciones_tipo_tmp" RENAME TO "enum_intervenciones_tipo";
    `);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.sequelize.query(`
      CREATE TYPE "enum_intervenciones_tipo_tmp" AS ENUM ('educativa', 'recreativa', 'terapeutica');
    `);
    await queryInterface.sequelize.query(`
      UPDATE "intervenciones"
      SET "tipo" = CASE "tipo"
        WHEN 'Educativa' THEN 'educativa'
        WHEN 'Recreativa' THEN 'recreativa'
        WHEN 'Terapeutica' THEN 'terapeutica'
        ELSE "tipo"
      END;
    `);
    await queryInterface.sequelize.query(`
      ALTER TABLE "intervenciones"
      ALTER COLUMN "tipo" TYPE "enum_intervenciones_tipo_tmp"
      USING "tipo"::text::enum_intervenciones_tipo_tmp;
    `);

    // 4. Eliminar enum capitalizado
    await queryInterface.sequelize.query(`
      DROP TYPE IF EXISTS "enum_intervenciones_tipo";
    `);

    // 5. Renombrar enum temporal
    await queryInterface.sequelize.query(`
      ALTER TYPE "enum_intervenciones_tipo_tmp" RENAME TO "enum_intervenciones_tipo";
    `);
  }
};
