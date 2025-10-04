import { Acompania } from "@/app/models/acompania.entity";
import { Banio } from "@/app/models/banio.entity";
import { Desparasitacion } from "@/app/models/desparasitacion.entity";
import { Gasto } from "@/app/models/gastos.entity";
import { InstitucionIntervencion } from "@/app/models/institucion-intervenciones.entity";
import { Institucion } from "@/app/models/institucion.entity";
import { Intervention } from "@/app/models/intervention.entity";
import { InstitucionPatologias } from "@/app/models/intitucion-patalogia";
import { Patologia } from "@/app/models/patologia.entity";
import { Perro } from "@/app/models/perro.entity";
import { RegistroSanidad } from "@/app/models/registro-sanidad.entity";
import { User } from "@/app/models/user.entity";
import { UsrPerro } from "@/app/models/usrperro.entity";
import { Vacuna } from "@/app/models/vacuna.entity";
import { Sequelize } from "sequelize-typescript";

const sequelize = new Sequelize({
  database: process.env.DB_NAME,
  username: process.env.DB_USER,
  password: process.env.DB_PASS,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : undefined,
  dialect: "postgres",
  models: [
    User,
    Intervention,
    Acompania,
    Gasto,
    Perro,
    UsrPerro,
    RegistroSanidad,
    Vacuna,
    Banio,
    Desparasitacion,
    Institucion,
    Patologia,
    InstitucionPatologias,
    InstitucionIntervencion,
  ],
  logging: false,
  define: {
    timestamps: true,
    paranoid: true,
  },
});

export default sequelize;
