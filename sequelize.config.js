const config = {
  dialect: "postgres",
  host: "localhost",
  database: "your_db",
  username: "root",
  password: "password",
  define: {
    timestamps: true,
    underscored: false,
  },
  // Disable auto migrations
  migrationStorage: "none",
  seederStorage: "none",
  sync: { force: false }, // Prevent automatic table creation, we wanna use migration files for consistency
};

module.exports = config;
