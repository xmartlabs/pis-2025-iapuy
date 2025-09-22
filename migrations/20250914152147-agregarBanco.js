module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("users", "banco", {
      type: Sequelize.STRING,
      allowNull: true,
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn("users", "banco");
  },
};
