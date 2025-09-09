import { Acompania } from "@/app/models/acompania.entity";
import { Intervencion } from "@/app/models/intervencion.entity";
import { User } from "@/app/models/user.entity";
import { Sequelize } from "sequelize-typescript";

const sequelize = new Sequelize({
  database: process.env.DB_NAME,
  username: process.env.DB_USER,
  password: process.env.DB_PASS,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : undefined,
  dialect: "postgres",
  models: [User, Intervencion, Acompania],
  logging: false,
  define: {
    timestamps: true,
    paranoid: true,
  },
});

export default sequelize;
