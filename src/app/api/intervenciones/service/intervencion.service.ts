import { Intervencion } from "@/app/models/intervencion.entity";
import { Institucion } from "@/app/models/institucion.entity";
import type { PaginationResultDto } from "@/lib/pagination/pagination-result.dto";
import type { PaginationDto } from "@/lib/pagination/pagination.dto";
import { getPaginationResultFromModel } from "@/lib/pagination/transform";
import { Op } from "sequelize";
import { UsrPerro } from "@/app/models/usrperro.entity";
import type { PayloadForUser } from "../../users/service/user.service";

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
export class IntervencionService {
  async findAll(
    pagination: PaginationDto,
    payload: PayloadForUser,
    months: string | null,
    statuses: string | null
  ): Promise<PaginationResultDto<Intervencion>> {
    const whereBase: Record<string, unknown> =
      payload.type === "Administrador"
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

      const parseMonthLabel = (label: string): { start: Date; end: Date } | null => {
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
        const r = parseMonthLabel(m) ?? ((): { start: Date; end: Date } | null => {
          const tryParse = (s: string) => {
            const parsed = Date.parse(`1 ${s}`);
            if (!isNaN(parsed)) {
              const d = new Date(parsed);
              return { start: new Date(d.getFullYear(), d.getMonth(), 1, 0, 0, 0, 0), end: new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59, 999) };
            }
            return null;
          };
          return tryParse(m) ?? tryParse(decodeURIComponent(m.replace(/\+/g, " ")).replace(".", ""));
        })();
        if (r) ranges.push(r);
      }

      if (ranges.length === 1) {
        timeStampWhere = { [Op.between]: [ranges[0].start, ranges[0].end] };
      } else if (ranges.length > 1) {
        timeStampWhere = { [Op.or]: ranges.map((r) => ({ [Op.between]: [r.start, r.end] })) };
      }
    }

    const includeInstitucionWhere = pagination.query
      ? { nombre: { [Op.iLike]: `%${pagination.query}%` } }
      : undefined;

    const result = await Intervencion.findAndCountAll({
      where: Object.assign({}, whereBase, timeStampWhere ? { timeStamp: timeStampWhere } : {}),
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
  ): Promise<PaginationResultDto<Intervencion>> {
    const interventionWhere = pagination.query
      ? { descripcion: { [Op.iLike]: `%${pagination.query}%` } }
      : {};

    const result = await Intervencion.findAndCountAll({
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
}
