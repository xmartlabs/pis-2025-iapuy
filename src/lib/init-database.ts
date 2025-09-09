import sequelize from "./database";

let initialized = false;

export async function initDatabase() {
  if (initialized) return;

  try {
    await sequelize.authenticate();
    console.log("Database connection established");

    initialized = true;
  } catch (error) {
    console.error("Database initialization failed:", error);
    throw error;
  }
}
