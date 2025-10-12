import { Acompania } from "@/app/models/acompania.entity";
import { Banio } from "@/app/models/banio.entity";
import { Desparasitacion } from "@/app/models/desparasitacion.entity";
import { Expense } from "@/app/models/expense.entity";
import { InstitucionIntervencion } from "@/app/models/institucion-intervenciones.entity";
import { Institucion } from "@/app/models/institucion.entity";
import { Intervention } from "@/app/models/intervention.entity";
import { Patologia } from "@/app/models/patologia.entity";
import { Perro } from "@/app/models/perro.entity";
import { PerroExperiencia } from "@/app/models/perros-experiencia.entity";
import { RegistroSanidad } from "@/app/models/registro-sanidad.entity";
import { User } from "@/app/models/user.entity";
import { UsrPerro } from "@/app/models/usrperro.entity";
import { Vacuna } from "@/app/models/vacuna.entity";
import { InstitutionContact } from "@/app/models/institution-contact.entity";
import { Sequelize } from "sequelize-typescript";
import { Paciente } from "@/app/models/pacientes.entity";
import { InstitucionPatologias } from "@/app/models/intitucion-patalogia.entity";

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
    Expense,
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
    Paciente,
    PerroExperiencia,
    InstitutionContact,
  ],
  logging: false,
  define: {
    timestamps: true,
    paranoid: true,
  },
});

export default sequelize;
