import { User } from "@/app/models/user.entity";
import sequelize from "./database";
import { Perro } from "@/app/models/perro.entity";
import { Intervention } from "@/app/models/intervention.entity";
import { Acompania } from "@/app/models/acompania.entity";
import { UsrPerro } from "@/app/models/usrperro.entity";
import { RegistroSanidad } from "@/app/models/registro-sanidad.entity";
import { Banio } from "@/app/models/banio.entity";
import { Vacuna } from "@/app/models/vacuna.entity";
import { Desparasitacion } from "@/app/models/desparasitacion.entity";
import { Institucion } from "@/app/models/institucion.entity";
import { Patologia } from "@/app/models/patologia.entity";
import { InstitucionPatologias } from "@/app/models/intitucion-patalogia.entity";

import { Expense } from "@/app/models/expense.entity";
import type { ModelStatic, Model } from "sequelize";
import { InstitutionContact } from "@/app/models/institution-contact.entity";
import { InstitucionIntervencion } from "@/app/models/institucion-intervenciones.entity";
import { PerroExperiencia } from "@/app/models/perros-experiencia.entity";
import { Paciente } from "@/app/models/pacientes.entity";
import { ResetToken } from "@/app/models/reset-tokens.entity";

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

  if (!hasAssociation(User, Intervention)) {
    User.belongsToMany(Intervention, {
      through: Acompania,
      foreignKey: "userId",
      as: "Intervenciones",
    });
  }

  if (!hasAssociation(ResetToken, User, "UserToReset")) {
    ResetToken.belongsTo(User, { foreignKey: "userId", as: "UserToReset" });
  }

  if (!hasAssociation(User, Expense)) {
    User.hasMany(Expense, {
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
  if (!hasAssociation(Perro, PerroExperiencia)) {
    Perro.hasMany(PerroExperiencia, {
      foreignKey: "perro_id",
      sourceKey: "id",
      as: "DogExperiences",
    });
  }
};

const registerUsrPerroAssociations = () => {
  if (!hasAssociation(UsrPerro, User)) {
    UsrPerro.belongsTo(User, { foreignKey: "userId", as: "User" });
  }
  if (!hasAssociation(UsrPerro, Intervention)) {
    UsrPerro.belongsTo(Intervention, {
      foreignKey: "intervencionId",
      as: "Intervencion",
    });
  }
  if (!hasAssociation(UsrPerro, Perro)) {
    UsrPerro.belongsTo(Perro, { foreignKey: "perroId", as: "Perro" });
  }
};

const registerIntervencionAssociations = () => {
  if (!hasAssociation(Intervention, User)) {
    Intervention.belongsToMany(User, {
      through: Acompania,
      as: "Users",
      foreignKey: "intervencionId",
    });
  }

  if (!hasAssociation(Intervention, Institucion)) {
    Intervention.belongsToMany(Institucion, {
      through: InstitucionIntervencion,
      as: "Institucions",
      foreignKey: "intervencionId",
      otherKey: "institucionId",
    });
  }
  if (!hasAssociation(Intervention, UsrPerro, "UsrPerroIntervention")) {
    Intervention.hasMany(UsrPerro, {
      as: "UsrPerroIntervention",
      foreignKey: "intervencionId",
    });
  }
  if (!hasAssociation(Intervention, PerroExperiencia)) {
    Intervention.hasMany(PerroExperiencia, {
      as: "DogExperiences",
      foreignKey: "intervencion_id",
    });
  }
  if (!hasAssociation(Intervention, Paciente)) {
    Intervention.hasMany(Paciente, {
      as: "Pacientes",
      foreignKey: "intervencion_id",
    });
  }
  if (!hasAssociation(Intervention, Acompania)) {
    Intervention.hasMany(Acompania, {
      as: "Acompania",
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
  if (!hasAssociation(InstitucionIntervencion, Intervention)) {
    InstitucionIntervencion.belongsTo(Intervention, {
      foreignKey: "intervencionId",
      as: "IntervencionesDeInstitucion",
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
  if (!hasAssociation(Banio, RegistroSanidad)) {
    Banio.belongsTo(RegistroSanidad, {
      foreignKey: "registroSanidadId",
      as: "RegistroSanidad",
    });
  }
  if (!hasAssociation(RegistroSanidad, Vacuna)) {
    RegistroSanidad.hasMany(Vacuna, {
      foreignKey: "registroSanidadId",
      as: "Vacunas",
    });
  }
  if (!hasAssociation(Vacuna, RegistroSanidad)) {
    Vacuna.belongsTo(RegistroSanidad, {
      foreignKey: "registroSanidadId",
      as: "RegistroSanidad",
    });
  }
  if (!hasAssociation(RegistroSanidad, Desparasitacion)) {
    RegistroSanidad.hasMany(Desparasitacion, {
      foreignKey: "registroSanidadId",
      as: "Desparasitaciones",
    });
  }
  if (!hasAssociation(Desparasitacion, RegistroSanidad)) {
    Desparasitacion.belongsTo(RegistroSanidad, {
      foreignKey: "registroSanidadId",
      as: "RegistroSanidad",
    });
  }
};

const registerInstitucionAssociations = () => {
  if (!hasAssociation(Institucion, Intervention)) {
    Institucion.belongsToMany(Intervention, {
      through: InstitucionIntervencion,
      as: "Intervenciones",
      otherKey: "intervencionId",
      foreignKey: "institucionId",
    });
  }
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
const registerInstitutionContactsAssociations = () => {
  if (!hasAssociation(Institucion, InstitutionContact)) {
    InstitutionContact.belongsTo(Institucion, {
      foreignKey: "institutionId",
    });
    Institucion.hasMany(InstitutionContact, {
      foreignKey: "institutionId",
      as: "InstitutionContacts",
    });
  }
};
const registerExpenseAssociations = () => {
  if (!hasAssociation(Expense, User)) {
    Expense.belongsTo(User, {
      foreignKey: "userId",
      targetKey: "ci",
      as: "User",
    });
  }
  if (!hasAssociation(Expense, Intervention)) {
    Expense.belongsTo(Intervention, {
      foreignKey: "interventionId",
      targetKey: "id",
      as: "Intervencion",
    });
  }

  if (!hasAssociation(Vacuna, Expense)) {
    Vacuna.hasOne(Expense, {
      foreignKey: "sanidadId",
      as: "VacunaExpense",
    });
  }
  if (!hasAssociation(Banio, Expense)) {
    Banio.hasOne(Expense, {
      foreignKey: "sanidadId",
      as: "BanioExpense",
    });
  }
  if (!hasAssociation(Desparasitacion, Expense)) {
    Desparasitacion.hasOne(Expense, {
      foreignKey: "sanidadId",
      as: "DesparasitacionExpense",
    });
  }
};
const registerPatientsAssociations = () => {
  if (!hasAssociation(Paciente, Intervention)) {
    Paciente.belongsTo(Intervention, {
      foreignKey: "intervencion_id",
      targetKey: "id",
      as: "Intervention",
    });
  }
  if (!hasAssociation(Paciente, Patologia)) {
    Paciente.hasMany(Patologia, {
      foreignKey: "id",
      sourceKey: "patologia_id",
      as: "Patologia",
    });
  }
};

const registerCompanionAssociations = () => {
  if (!hasAssociation(Acompania, User)) {
    Acompania.belongsTo(User, { foreignKey: "userId", as: "User" });
  }
  if (!hasAssociation(Acompania, Intervention)) {
    Acompania.belongsTo(Intervention, {
      foreignKey: "intervencionId",
      as: "Intervention",
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
    registerExpenseAssociations();
    registerInstitutionContactsAssociations();
    registerPatientsAssociations();
    registerCompanionAssociations();
    initialized = true;
    initPromise = null;
  })();

  // assignment is safe: we just created the localPromise and checked initPromise earlier
  // eslint-disable-next-line require-atomic-updates
  initPromise = localPromise;

  await localPromise;
}
