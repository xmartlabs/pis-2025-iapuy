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
import { InstitutionContact } from "@/app/models/institution-contact.entity";

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
    });
  }

  if (!hasAssociation(User, Gasto)) {
    User.hasMany(Gasto, {
      foreignKey: "userId",
      sourceKey: "ci",
    });
  }
};

const registerPerroAssociations = () => {
  if (!hasAssociation(Perro, User)) {
    Perro.belongsTo(User, { foreignKey: "duenioId" });
  }
  if (!hasAssociation(Perro, UsrPerro)) {
    Perro.hasMany(UsrPerro, { foreignKey: "perroId" });
  }
  if (!hasAssociation(Perro, RegistroSanidad)) {
    Perro.hasOne(RegistroSanidad, { foreignKey: "perroId" });
  }
};

const registerUsrPerroAssociations = () => {
  if (!hasAssociation(UsrPerro, User)) {
    UsrPerro.belongsTo(User, { foreignKey: "userId" });
  }
  if (!hasAssociation(UsrPerro, Intervencion)) {
    UsrPerro.belongsTo(Intervencion, { foreignKey: "intervencionId" });
  }
  if (!hasAssociation(UsrPerro, Perro)) {
    UsrPerro.belongsTo(Perro, { foreignKey: "perroId" });
  }
};

const registerIntervencionAssociations = () => {
  if (!hasAssociation(Intervencion, User)) {
    Intervencion.belongsToMany(User, {
      through: Acompania,
      foreignKey: "intervencionId",
    });
  }
};

const registerRegistroSanidadAssociations = () => {
  if (!hasAssociation(RegistroSanidad, Perro)) {
    RegistroSanidad.belongsTo(Perro, {
      foreignKey: "perroId",
      targetKey: "id",
    });
  }
  if (!hasAssociation(RegistroSanidad, Banio)) {
    RegistroSanidad.hasMany(Banio, {
      foreignKey: "registroSanidadId",
    });
  }
  if (!hasAssociation(RegistroSanidad, Vacuna)) {
    RegistroSanidad.hasMany(Vacuna, {
      foreignKey: "registroSanidadId",
    });
  }
  if (!hasAssociation(RegistroSanidad, Desparasitacion)) {
    RegistroSanidad.hasMany(Desparasitacion, {
      foreignKey: "registroSanidadId",
    });
  }
};

const registerInstitucionAssociations = () => {
  if (!hasAssociation(Institucion, Patologia)) {
    Institucion.belongsToMany(Patologia, {
      through: InstitucionPatologias,
      foreignKey: "institucionId",
      otherKey: "patologiaId",
    });
  }
  if (!hasAssociation(Patologia, Institucion)) {
    Patologia.belongsToMany(Institucion, {
      through: InstitucionPatologias,
      foreignKey: "patologiaId",
      otherKey: "institucionId",
    });
  }
};
const registerInstitutionContactsAssociations = () => {
  if (!hasAssociation(Institucion, InstitutionContact)) {
    InstitutionContact.belongsTo(Institucion, {
      foreignKey: "institutionId",
    });
  }
};
const registerGastoAssociations = () => {
  if (!hasAssociation(Gasto, User)) {
    Gasto.belongsTo(User, { foreignKey: "userId", targetKey: "ci" });
  }
  if (!hasAssociation(Gasto, Intervencion)) {
    Gasto.belongsTo(Intervencion, {
      foreignKey: "intervencionId",
      targetKey: "id",
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
    registerGastoAssociations();
    registerInstitutionContactsAssociations();
    initialized = true;
    initPromise = null;
  })();

  // assignment is safe: we just created the localPromise and checked initPromise earlier
  // eslint-disable-next-line require-atomic-updates
  initPromise = localPromise;

  await localPromise;
}
