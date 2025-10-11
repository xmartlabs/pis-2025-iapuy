
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("intervenciones", "driveLink", {
      type: Sequelize.STRING,
      allowNull: true,
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn("intervenciones", "driveLink");
  },
};