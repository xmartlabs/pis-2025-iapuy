import { User } from "@/app/models/user.entity";
import sequelize from "./database";
import { Perro } from "@/app/models/perro.entity";
import { Intervencion } from "@/app/models/intervencion.entity";
import { Acompania } from "@/app/models/acompania.entity";
import { UsrPerro } from "@/app/models/usrperro.entity";
import { RegistroSanidad } from "@/app/models/registro-sanidad.entity";
import { Banio } from "@/app/models/banio.entity";
import { Vacuna } from "@/app/models/vacuna.entity";
import { Desparasitacion } from "@/app/models/desparasitacion.entity";
import { Institucion } from "@/app/models/institucion.entity";
import { Patologia } from "@/app/models/patologia.entity";
import { InstitucionPatologias } from "@/app/models/intitucion-patalogia";

import { Gasto } from "@/app/models/gastos.entity";

let initialized = false;

export async function initDatabase() {
  if (initialized) return;

  try {
    await sequelize.authenticate();
    console.log("Database connection established");

    initialized = true;

    /* 
    =========== User relationships ===============
    */
    User.hasMany(Perro, { foreignKey: "duenioId", as: "userPerros" });

    User.belongsToMany(Intervencion, {
      through: Acompania,
      foreignKey: "userId",
    });

    User.hasMany(Gasto, {
      foreignKey: "userId",
      sourceKey: "ci",
    });

    /* 
    =========== Perro relationships ===============
    */
    Perro.belongsTo(User, { foreignKey: "duenioId" });

    // Entidad intermedia para relacion N x N con usuarios
    UsrPerro.belongsTo(User);
    UsrPerro.belongsTo(Intervencion);
    UsrPerro.belongsTo(Perro);

    /* 
    =========== Intervenciones relationships ===============
    */

    Intervencion.belongsToMany(User, {
      through: Acompania,
      foreignKey: "intervencionId",
    });

    /* 
    =========== RegistroSanidad relationships ===============
    */

    RegistroSanidad.belongsTo(Perro, {
      foreignKey: "perroId",
      targetKey: "id",
    });
    RegistroSanidad.hasMany(Banio, {
      foreignKey: "registroSanidadId",
    });

    RegistroSanidad.hasMany(Vacuna, {
      foreignKey: "registroSanidadId",
    });

    RegistroSanidad.hasMany(Desparasitacion, {
      foreignKey: "registroSanidadId",
    });

    /* 
    =========== Institucion relationships ===============
    */

    Institucion.belongsToMany(Patologia, {
      through: InstitucionPatologias,
      foreignKey: "institucionId",
      otherKey: "patologiaId",
    });

    Patologia.belongsToMany(Institucion, {
      through: InstitucionPatologias,
      foreignKey: "patologiaId",
      otherKey: "institucionId",
    });
    /* 
    =========== Gastos relationships ===============
    */

    Gasto.belongsTo(User, { foreignKey: "userId", targetKey: "ci" });
    Gasto.belongsTo(Intervencion, {
      foreignKey: "intervencionId",
      targetKey: "id",
    });
  } catch (error) {
    console.error("Database initialization failed:", error);
    throw error;
  }
}
