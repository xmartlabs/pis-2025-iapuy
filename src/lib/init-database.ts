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
import type { ModelStatic, Model } from "sequelize";
import { InstitucionIntervencion } from "@/app/models/institucion-intervenciones.entity";

// Helper to detect if an association already exists between two models
const hasAssociation = (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  sourceModel: ModelStatic<Model<any, any>>,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  targetModel: ModelStatic<Model<any, any>>,
  as?: string
): boolean => {
  const assocs = sourceModel.associations ?? {};
  if (as) return Boolean(assocs[as]);
  return Object.values(assocs).some(
    (a) => (a as { target?: unknown }).target === targetModel
  );
};

const registerUserAssociations = () => {
  if (!hasAssociation(User, Perro, "perros")) {
    User.hasMany(Perro, { foreignKey: "duenioId", as: "perros" });
  }

  if (!hasAssociation(User, Intervencion)) {
    User.belongsToMany(Intervencion, {
      through: Acompania,
      foreignKey: "userId",
      as: "Intervenciones",
    });
  }

  if (!hasAssociation(User, Gasto)) {
    User.hasMany(Gasto, {
      foreignKey: "userId",
      sourceKey: "ci",
      as: "Gastos",
    });
  }
};

const registerPerroAssociations = () => {
  if (!hasAssociation(Perro, User)) {
    Perro.belongsTo(User, { foreignKey: "duenioId", as: "User" });
  }
  if (!hasAssociation(Perro, UsrPerro)) {
    Perro.hasMany(UsrPerro, { foreignKey: "perroId", as: "UsrPerros" });
  }
  if (!hasAssociation(Perro, RegistroSanidad)) {
    Perro.hasOne(RegistroSanidad, {
      foreignKey: "perroId",
      as: "RegistroSanidad",
    });
  }
};

const registerUsrPerroAssociations = () => {
  if (!hasAssociation(UsrPerro, User)) {
    UsrPerro.belongsTo(User, { foreignKey: "userId", as: "User" });
  }
  if (!hasAssociation(UsrPerro, Intervencion)) {
    UsrPerro.belongsTo(Intervencion, {
      foreignKey: "intervencionId",
      as: "Intervencion",
    });
  }
  if (!hasAssociation(UsrPerro, Perro)) {
    UsrPerro.belongsTo(Perro, { foreignKey: "perroId", as: "Perro" });
  }
};

const registerIntervencionAssociations = () => {
  if (!hasAssociation(Intervencion, User)) {
    Intervencion.belongsToMany(User, {
      through: Acompania,
      as: "Users",
      foreignKey: "intervencionId",
    });
  }
  if (!hasAssociation(Intervencion, Institucion)) {
    Intervencion.belongsToMany(Institucion, {
      through: InstitucionIntervencion,
      as: "Institucions",
      foreignKey: "intervencionId",
      otherKey: "institucionId",
    });
  }
  if (!hasAssociation(Intervencion, Perro)) {
    Intervencion.hasMany(UsrPerro, {
      as: "UsrPerroIntervention",
      foreignKey: "intervencionId",
    });
  }
};

const registerInstitucionIntervencionAssociations = () => {
  if (!hasAssociation(InstitucionIntervencion, Institucion)) {
    InstitucionIntervencion.belongsTo(Institucion, {
      as: "Institution",
      foreignKey: "institucionId",
    });
  }
  if (!hasAssociation(InstitucionIntervencion, Intervencion)) {
    InstitucionIntervencion.belongsTo(Intervencion, {
      foreignKey: "intervencionId",
      as: "Users",
    });
  }
};

const registerRegistroSanidadAssociations = () => {
  if (!hasAssociation(RegistroSanidad, Perro)) {
    RegistroSanidad.belongsTo(Perro, {
      foreignKey: "perroId",
      targetKey: "id",
      as: "Perro",
    });
  }
  if (!hasAssociation(RegistroSanidad, Banio)) {
    RegistroSanidad.hasMany(Banio, {
      foreignKey: "registroSanidadId",
      as: "Banios",
    });
  }
  if (!hasAssociation(RegistroSanidad, Vacuna)) {
    RegistroSanidad.hasMany(Vacuna, {
      foreignKey: "registroSanidadId",
      as: "Vacunas",
    });
  }
  if (!hasAssociation(RegistroSanidad, Desparasitacion)) {
    RegistroSanidad.hasMany(Desparasitacion, {
      foreignKey: "registroSanidadId",
      as: "Desparasitaciones",
    });
  }
};

const registerInstitucionAssociations = () => {
  if (!hasAssociation(Institucion, Patologia)) {
    Institucion.belongsToMany(Patologia, {
      through: InstitucionPatologias,
      foreignKey: "institucionId",
      otherKey: "patologiaId",
      as: "Patologias",
    });
  }
  if (!hasAssociation(Patologia, Institucion)) {
    Patologia.belongsToMany(Institucion, {
      through: InstitucionPatologias,
      foreignKey: "patologiaId",
      otherKey: "institucionId",
      as: "Instituciones",
    });
  }
};

const registerGastoAssociations = () => {
  if (!hasAssociation(Gasto, User)) {
    Gasto.belongsTo(User, {
      foreignKey: "userId",
      targetKey: "ci",
      as: "User",
    });
  }
  if (!hasAssociation(Gasto, Intervencion)) {
    Gasto.belongsTo(Intervencion, {
      foreignKey: "intervencionId",
      targetKey: "id",
      as: "Intervencion",
    });
  }
};

let initialized = false;
let initPromise: Promise<void> | null = null;
export async function initDatabase(): Promise<void> {
  if (initialized) return;
  if (initPromise) await initPromise;

  const localPromise = (async () => {
    await sequelize.authenticate();

    // Execute the registration helpers defined at module scope
    registerUserAssociations();
    registerPerroAssociations();
    registerUsrPerroAssociations();
    registerIntervencionAssociations();
    registerRegistroSanidadAssociations();
    registerInstitucionAssociations();
    registerInstitucionIntervencionAssociations();
    registerGastoAssociations();

    initialized = true;
    initPromise = null;
  })();

  // assignment is safe: we just created the localPromise and checked initPromise earlier
  // eslint-disable-next-line require-atomic-updates
  initPromise = localPromise;

  await localPromise;
}
