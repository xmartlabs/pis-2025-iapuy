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
          as: "usrPerro",
          required: false,
          attributes: ["userId", "perroId"],
        },
        {
          model: Acompania,
          as: "acompania",
          required: false,
          attributes: ["userId"],
        },
      ],
    });

    if (!intervention) throw new Error("Intervención no encontrada");

    const allCis = [...datos.duplas.map((d) => d.ci), ...datos.acompaniantes];
    const allPerros = datos.duplas.map((d) => d.perro);

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
        intervention.usrPerro?.some((u: UsrPerro) => u.userId === dupla.ci) ??
        false;

      const uA =
        intervention.acompania?.some((u: Acompania) => u.userId === dupla.ci) ??
        false;

      if (uA || uG)
        throw new Error(
          `El usuario con ci: ${dupla.ci} ya participa de la intervención`
        );

      const pG =
        intervention.usrPerro?.some(
          (u: UsrPerro) => u.perroId === dupla.perro
        ) ?? false;

      if (pG)
        throw new Error(
          `El perro ${dupla.perro} ya participa de la intervención`
        );
    }

    for (const usrCi of datos.acompaniantes ?? []) {
      const uA =
        intervention.acompania?.some((u: Acompania) => u.userId === usrCi) ??
        false;
      const uG =
        intervention.usrPerro?.some((u: UsrPerro) => u.userId === usrCi) ??
        false;
      if (uA || uG)
        throw new Error(
          `El usuario de ci: ${usrCi} ya participa de la intervención`
        );
    }

    const transaction = await sequelize.transaction();

    try {
      await Promise.all([
        UsrPerro.bulkCreate(
          datos.duplas?.map((dupla) => {
            return {
              intervencionId: datos.intervention,
              perroId: dupla.perro,
              userId: dupla.ci,
            };
          }),
          { transaction }
        ),
        Acompania.bulkCreate(
          datos.acompaniantes?.map((usrCi) => {
            return { userId: usrCi, intervencionId: datos.intervention };
          }),
          { transaction }
        ),
      ]);

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
}
