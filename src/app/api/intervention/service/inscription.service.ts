/* eslint-disable arrow-body-style */
import { UsrPerro } from "@/app/models/usrperro.entity";
import { Acompania } from "@/app/models/acompania.entity";
import { User } from "@/app/models/user.entity";
import { Perro } from "@/app/models/perro.entity";
import type { InscripcionDto } from "../dtos/inscription.dto";
import { Intervention } from "@/app/models/intervention.entity";
import sequelize from "@/lib/database";
import { Op } from "sequelize";

export class InscripcionService {
  async inscribirse(datos: InscripcionDto) {
    const intervention = await Intervention.findOne({
      where: { id: datos.intervention },
      include: [
        {
          model: UsrPerro,
          as: "UsrPerroIntervention",
          required: false,
          attributes: ["userId", "perroId"],
        },
        {
          model: Acompania,
          as: "Acompania",
          required: false,
          attributes: ["userId"],
        },
      ],
    });

    if (!intervention) throw new Error("Intervención no encontrada");

    const allCis = [...datos.duplas.map((d) => d.ci), ...datos.acompaniantes];
    const allPerros = datos.duplas.map((d) => d.perro);
    const cupos = intervention.UsrPerroIntervention
      ? intervention.pairsQuantity - intervention.UsrPerroIntervention.length
      : intervention.pairsQuantity;

    if (cupos <= 0)
      throw new Error("La intervencion ya tiene los cupos llenos.");

    const [users, perros] = await Promise.all([
      User.findAll({
        where: { ci: { [Op.in]: allCis } },
        attributes: ["ci"],
      }),
      Perro.findAll({
        where: { id: { [Op.in]: allPerros } },
        attributes: ["id"],
      }),
    ]);

    if (!allCis.every((ci) => users.some((usr) => usr.ci === ci)))
      throw new Error("Usuario no encontrado");

    if (!allPerros.every((p) => perros.some((perro) => perro.id === p)))
      throw new Error("Perro no encontrado");

    for (const dupla of datos.duplas ?? []) {
      const uG =
        intervention.UsrPerroIntervention?.some(
          (u: UsrPerro) => u.userId === dupla.ci
        ) ?? false;

      const uA =
        intervention.Acompania?.some((u: Acompania) => u.userId === dupla.ci) ??
        false;

      if (uA || uG)
        throw new Error(
          `El usuario con ci: ${dupla.ci} ya participa de la intervención`
        );

      const pG =
        intervention.UsrPerroIntervention?.some(
          (u: UsrPerro) => u.perroId === dupla.perro
        ) ?? false;

      if (pG)
        throw new Error(
          `El perro ${dupla.perro} ya participa de la intervención`
        );
    }

    if (datos.duplas && datos.duplas.length > cupos)
      throw new Error(
        `No se pueden registrar ${datos.duplas.length} duplas, quedan ${cupos} cupos disponibles`
      );

    for (const usrCi of datos.acompaniantes ?? []) {
      const uA =
        intervention.Acompania?.some((u: Acompania) => u.userId === usrCi) ??
        false;
      const uG =
        intervention.UsrPerroIntervention?.some(
          (u: UsrPerro) => u.userId === usrCi
        ) ?? false;
      if (uA || uG)
        throw new Error(
          `El usuario de ci: ${usrCi} ya participa de la intervención`
        );
    }

    const transaction = await sequelize.transaction();

    try {
      const promises: Promise<unknown>[] = [];

      promises.push(
        UsrPerro.bulkCreate(
          datos.duplas?.map((dupla) => ({
            intervencionId: datos.intervention,
            perroId: dupla.perro,
            userId: dupla.ci,
          })),
          { transaction }
        )
      );

      promises.push(
        Acompania.bulkCreate(
          datos.acompaniantes?.map((usrCi) => ({
            userId: usrCi,
            intervencionId: datos.intervention,
          })),
          { transaction }
        )
      );

      if (datos.duplas && datos.duplas.length === cupos) {
        promises.push(
          intervention.update({ status: "Cupo completo" }, { transaction })
        );
      }

      await Promise.all(promises);

      await transaction.commit();

      return {
        message: "Inscripciones realizadas con éxito.",
        status: 200,
      };
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  async listarOpciones(id: string): Promise<{
    pairsQuantity: number;
    people: { ci: string; nombre: string }[];
    perros: { id: string; nombre: string }[];
  }> {
    const intervention = await Intervention.findOne({
      where: { id },
      attributes: ["id", "pairsQuantity"],

      include: [
        {
          model: UsrPerro,
          as: "UsrPerroIntervention",
          attributes: ["userId", "perroId"],
        },
        {
          model: Acompania,
          as: "Acompania",
          attributes: ["userId"],
        },
      ],
    });

    if (!intervention)
      throw new Error("Intervencion no existe en la base de datos.");

    const usersIds = [
      ...(intervention.UsrPerroIntervention?.map(
        (usrperro) => usrperro.userId
      ) ?? []),
      ...(intervention.Acompania?.map((aco) => aco.userId) ?? []),
    ];
    const perrosIds =
      intervention.UsrPerroIntervention?.map((usrperro) => usrperro.perroId) ??
      [];

    const [people, perros] = await Promise.all([
      User.findAll({
        where: { ci: { [Op.notIn]: usersIds } },
        attributes: ["ci", "nombre"],
      }),
      Perro.findAll({
        where: { id: { [Op.notIn]: perrosIds } },
        attributes: ["id", "nombre"],
      }),
    ]);
    const pairsQuantity = intervention.UsrPerroIntervention
      ? intervention.pairsQuantity - intervention.UsrPerroIntervention.length
      : intervention.pairsQuantity;
    return { pairsQuantity, people, perros };
  }
}
