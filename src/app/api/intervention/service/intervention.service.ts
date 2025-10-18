import { Intervention } from "@/app/models/intervention.entity";
import { Institucion } from "@/app/models/institucion.entity";
import type { PaginationResultDto } from "@/lib/pagination/pagination-result.dto";
import type { PaginationDto } from "@/lib/pagination/pagination.dto";
import { getPaginationResultFromModel } from "@/lib/pagination/transform";
import { Op } from "sequelize";
import { UsrPerro } from "@/app/models/usrperro.entity";
import type { PayloadForUser } from "../../users/service/user.service";
import type { CreateInterventionDto } from "../dtos/create-intervention.dto";
import { InstitucionIntervencion } from "@/app/models/institucion-intervenciones.entity";
import sequelize from "@/lib/database";
import { Paciente } from "@/app/models/pacientes.entity";

import path from "path";
import fs from "fs";
import type { EvaluateInterventionDTO } from "../dtos/evaluate-intervention.dto";
import { PerroExperiencia } from "@/app/models/perros-experiencia.entity";
import { InstitucionPatologias } from "@/app/models/intitucion-patalogia.entity";
import { Perro } from "@/app/models/perro.entity";
import { Patologia } from "@/app/models/patologia.entity";
import { User } from "@/app/models/user.entity";
import { Acompania } from "@/app/models/acompania.entity";

const monthMap: Record<string, number> = {
  ene: 0,
  enero: 0,
  feb: 1,
  febrero: 1,
  mar: 2,
  marzo: 2,
  abr: 3,
  abril: 3,
  may: 4,
  mayo: 4,
  jun: 5,
  junio: 5,
  jul: 6,
  julio: 6,
  ago: 7,
  agosto: 7,
  sep: 8,
  sept: 8,
  septiembre: 8,
  oct: 9,
  octubre: 9,
  nov: 10,
  noviembre: 10,
  dic: 11,
  diciembre: 11,
};

type InterventionWithInstitution = Intervention & {
  institutionName: string | null;
};

export class InterventionService {
  async findAll(
    pagination: PaginationDto,
    payload: PayloadForUser,
    months: string | null,
    statuses: string | null
  ): Promise<PaginationResultDto<Intervention>> {
    const whereBase: Record<string, unknown> =
      payload.type === "Administrador" || payload.type === "Colaborador"
        ? {}
        : {
            userId: payload.ci,
          };

    if (statuses && statuses.trim()) {
      const statusesArr = statuses
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
      if (statusesArr.length) {
        whereBase.status = { [Op.in]: statusesArr };
      }
    }

    let timeStampWhere: Record<string, unknown> | undefined = undefined;
    if (months && months.trim()) {
      const monthsArr = months
        .split(",")
        .map((m) => m.trim())
        .filter(Boolean);

      const ranges: Array<{ start: Date; end: Date }> = [];

      const parseMonthLabel = (
        label: string
      ): { start: Date; end: Date } | null => {
        let normalized = label.replace(/\+/g, " ");
        try {
          normalized = decodeURIComponent(normalized);
        } catch {
          // ignore
        }
        normalized = normalized.replace(".", "").trim();

        const isoMatch = normalized.match(/^(\d{4})-(\d{2})$/);
        if (isoMatch) {
          const year = Number(isoMatch[1]);
          const month = Number(isoMatch[2]) - 1;
          if (month >= 0 && month <= 11) {
            const start = new Date(year, month, 1, 0, 0, 0, 0);
            const end = new Date(year, month + 1, 0, 23, 59, 59, 999);
            return { start, end };
          }
        }

        const parts = normalized.split(/\s+/);
        if (parts.length >= 2) {
          const yearPart = parts[parts.length - 1];
          const monthPart = parts.slice(0, parts.length - 1).join(" ");
          const year = Number(yearPart);
          if (!Number.isNaN(year) && year > 1900 && year < 3000) {
            const key = monthPart.toLowerCase();
            const monthIdx = monthMap[key] ?? monthMap[key.slice(0, 3)];
            if (typeof monthIdx === "number") {
              const start = new Date(year, monthIdx, 1, 0, 0, 0, 0);
              const end = new Date(year, monthIdx + 1, 0, 23, 59, 59, 999);
              return { start, end };
            }
          }
        }

        return null;
      };

      for (const m of monthsArr) {
        const r =
          parseMonthLabel(m) ??
          ((): { start: Date; end: Date } | null => {
            const tryParse = (s: string) => {
              const parsed = Date.parse(`1 ${s}`);
              if (!isNaN(parsed)) {
                const d = new Date(parsed);
                return {
                  start: new Date(d.getFullYear(), d.getMonth(), 1, 0, 0, 0, 0),
                  end: new Date(
                    d.getFullYear(),
                    d.getMonth() + 1,
                    0,
                    23,
                    59,
                    59,
                    999
                  ),
                };
              }
              return null;
            };
            return (
              tryParse(m) ??
              tryParse(
                decodeURIComponent(m.replace(/\+/g, " ")).replace(".", "")
              )
            );
          })();
        if (r) ranges.push(r);
      }

      if (ranges.length === 1) {
        timeStampWhere = { [Op.between]: [ranges[0].start, ranges[0].end] };
      } else if (ranges.length > 1) {
        timeStampWhere = {
          [Op.or]: ranges.map((r) => ({ [Op.between]: [r.start, r.end] })),
        };
      }
    }

    const includeInstitucionWhere = pagination.query
      ? { nombre: { [Op.iLike]: `%${pagination.query}%` } }
      : undefined;

    const result = await Intervention.findAndCountAll({
      where: Object.assign(
        {},
        whereBase,
        timeStampWhere ? { timeStamp: timeStampWhere } : {}
      ),
      include: [
        {
          model: Institucion,
          as: "Institucions",
          attributes: ["id", "nombre"],
          where: includeInstitucionWhere,
        },
      ],
      limit: pagination.size,
      offset: pagination.getOffset(),
      order: pagination.getOrder(),
    });
    return getPaginationResultFromModel(pagination, result);
  }

  async findInterventionByDogId(
    pagination: PaginationDto,
    dogId: string,
    payload: PayloadForUser
  ): Promise<PaginationResultDto<Intervention>> {
    const interventionWhere = pagination.query
      ? { descripcion: { [Op.iLike]: `%${pagination.query}%` } }
      : undefined;

    const result = await Intervention.findAndCountAll({
      where: interventionWhere,
      include: [
        {
          model: UsrPerro,
          as: "UsrPerroIntervention",
          where:
            payload.type === "Administrador"
              ? {
                  perroId: dogId,
                }
              : {
                  perroId: dogId,
                  userId: payload.ci,
                },
          attributes: [],
          required: true,
        },
        {
          model: Institucion,
          as: "Institucions",
          attributes: ["id", "nombre"],
          where: interventionWhere,
        },
      ],
      limit: pagination.size,
      offset: pagination.getOffset(),
      order: pagination.getOrder(),
    });
    return getPaginationResultFromModel(pagination, result);
  }

  async create(request: CreateInterventionDto): Promise<Intervention> {
    const institution = await Institucion.findOne({
      where: { nombre: request.institution },
    });
    if (!institution) {
      throw new Error(
        `Institution with name "${request.institution}" not found`
      );
    }
    const transaction = await sequelize.transaction();

    try {
      const intervention = await Intervention.create(
        {
          timeStamp: request.timeStamp,
          tipo: request.type,
          pairsQuantity: request.pairsQuantity,
          description: request.description,
          status: request.state,
        },
        { transaction }
      );

      await InstitucionIntervencion.create(
        {
          institucionId: institution.id,
          intervencionId: intervention.id,
        },
        { transaction }
      );

      await transaction.commit();

      return intervention;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  async evaluate(id: string, body: EvaluateInterventionDTO) {
    const transaction = await sequelize.transaction();
    try {
      const intervention = await Intervention.findByPk(id, { transaction });
      if (!intervention) throw new Error("Intervention not found");

      const picturesUrls: string[] = [];
      if (body.pictures && body.pictures.length > 0) {
        const uploadDir = path.join(
          process.cwd(),
          "public",
          "interventionsPictures",
          id
        );
        if (!fs.existsSync(uploadDir)) {
          fs.mkdirSync(uploadDir, { recursive: true });
        }

        for (const file of body.pictures) {
          if (file.size > 15 * 1024 * 1024) {
            throw new Error(
              `El archivo ${file.name} excede el tamaño máximo permitido el cual es de 15MB`
            );
          }
          if (!file.type.startsWith("image/")) {
            throw new Error(`El archivo ${file.name} no es una imagen válida`);
          }
          const fileName = `${Date.now()}-${file.name}`;
          const filePath = path.join(uploadDir, fileName);
          // eslint-disable-next-line no-await-in-loop
          const buffer = Buffer.from(await file.arrayBuffer());
          fs.writeFileSync(filePath, buffer);
          picturesUrls.push(`/interventionsPictures/${id}/${fileName}`);
        }
        intervention.fotosUrls = picturesUrls;
      }

      if (body.driveLink) {
        intervention.driveLink = body.driveLink;
      }
      intervention.status = "Evaluada"; //! agrego este estado para que no la vuelvan a evaluar????
      await intervention.save({ transaction });
      await Promise.all(
        body.patients.map((patient) =>
          Paciente.create(
            {
              nombre: patient.name,
              edad: patient.age,
              ...(patient.pathology_id !== "" && {
                patologia_id: patient.pathology_id,
              }),
              intervencion_id: id,
              experiencia: patient.experience,
            },
            { transaction }
          )
        )
      );

      await Promise.all(
        body.experiences.map((dogExperience) =>
          PerroExperiencia.create(
            {
              perro_id: dogExperience.perro_id,
              intervencion_id: id,
              experiencia: dogExperience.experiencia,
            },
            { transaction }
          )
        )
      );

      await transaction.commit();
      return intervention;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  async findAllPathologiesbyId(id: string) {
    const intervention = await Intervention.findByPk(id);
    if (intervention?.tipo !== "Terapeutica") {
      return [];
    }
    const relation = await InstitucionIntervencion.findOne({
      where: { intervencionId: id },
    });
    if (!relation) {
      return [];
    }
    const institutionId = relation.institucionId;
    const pathologiesRelation = await InstitucionPatologias.findAll({
      where: { institucionId: institutionId },
    });
    const pathologies = await Promise.all(
      pathologiesRelation.map((rel) =>
        Patologia.findByPk(rel.patologiaId, {
          attributes: ["id", "nombre"],
        })
      )
    );
    return pathologies;
  }

  async findAllDogsbyId(id: string) {
    const pairsUserDog = await UsrPerro.findAll({
      where: { intervencionId: id },
    });
    if (!pairsUserDog) {
      return [];
    }
    const dogs = await Promise.all(
      pairsUserDog.map((pair) =>
        Perro.findByPk(pair.perroId, {
          attributes: ["id", "nombre"],
        })
      )
    );
    return dogs;
  }

  async findIntervention(id: string) {
    const intervention = await Intervention.findByPk(id);

    if (!intervention) return null;
    const link = await InstitucionIntervencion.findOne({
      where: { intervencionId: id },
    });

    let institutionName = null;
    if (link?.institucionId) {
      const institution = await Institucion.findByPk(link.institucionId, {
        attributes: ["nombre"],
      });
      institutionName = institution?.nombre ?? null;
    }

    return {
      ...intervention.toJSON(),
      institutionName,
    } as InterventionWithInstitution;
  }

  async delete(id: string): Promise<void> {
    const res = await Intervention.destroy({ where: { id } });
    if (res === 0) {
      throw new Error(`Intervention not found with id ${id}`);
    }
  }

  async getInterventionDetails(id: string) {
    const intervention = await Intervention.findOne({
      where: { id },
      include: [
        {
          model: Institucion,
          as: "Institucions",
          attributes: ["id", "nombre"],
        },
        {
          model: UsrPerro,
          as: "UsrPerroIntervention",
          attributes: ["perroId", "userId"],
          include: [
            {
              model: Perro,
              as: "Perro",
              attributes: ["id", "nombre"],
              include: [
                {
                  model: PerroExperiencia,
                  as: "DogExperiences",
                  attributes: ["id", "experiencia"],
                  where: { intervencion_id: id },
                  required: false,
                },
              ],
            },
            { model: User, as: "User", attributes: ["ci", "nombre"] },
          ],
        },
        {
          model: Paciente,
          as: "Pacientes",
          attributes: ["id", "nombre", "edad", "patologia_id", "experiencia"],
          include: [
            { model: Patologia, as: "Patologia", attributes: ["id", "nombre"] },
          ],
        },
        {
          model: Acompania,
          as: "Acompania",
          attributes: ["userId"],
          include: [{ model: User, as: "User", attributes: ["ci", "nombre"] }],
        },
      ],
    });
    return intervention;
  }
}
