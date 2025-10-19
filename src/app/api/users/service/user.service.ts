import { User } from "@/app/models/user.entity";
import { Perro } from "@/app/models/perro.entity";
import type { CreateUserDto } from "../dtos/create-user.dto";
import { Intervention } from "../../../models/intervention.entity";
import type { PaginationDto } from "@/lib/pagination/pagination.dto";
import type { PaginationResultDto } from "@/lib/pagination/pagination-result.dto";
import { getPaginationResultFromModel } from "@/lib/pagination/transform";
import { Hashing } from "@/lib/crypto/hash";
import { Op } from "sequelize";
import sequelize from "@/lib/database";
import jwt from "jsonwebtoken";

export interface PayloadForUser extends jwt.JwtPayload {
  ci: string;
  name: string;
  type: string;
}
function normalizePerros(input: unknown): string[] {
  if (Array.isArray(input)) return input.map(String);

  if (input === null) return [];

  if (typeof input === "string") {
    try {
      const parsed: unknown = JSON.parse(input);
      if (Array.isArray(parsed)) return parsed.map(String);
      return input ? [input] : [];
    } catch {
      return input ? [input] : [];
    }
  }

  return [];
}

export class UserService {
  async findAll(pagination: PaginationDto): Promise<PaginationResultDto<User>> {
    const result = await User.findAndCountAll({
      where: pagination.query
        ? { nombre: { [Op.iLike]: `%${pagination.query}%` } }
        : undefined,
      attributes: ["ci", "nombre", "celular", "banco", "cuentaBancaria"],
      include: [
        {
          model: Intervention,
          as: "Intervenciones",
        },
        {
          model: Perro,
          as: "perros",
        },
      ],
      limit: pagination.size,
      offset: pagination.getOffset(),
      order: [[pagination.orderBy ?? "nombre", pagination.order ?? "ASC"]],
    });

    return getPaginationResultFromModel(pagination, result);
  }

  async findOne(ci: string): Promise<User | null> {
    return await User.findByPk(ci, {
      attributes: [
        "ci",
        "nombre",
        "celular",
        "banco",
        "cuentaBancaria",
        "esAdmin",
      ],
      include: [
        {
          model: Perro,
          as: "perros",
          attributes: ["nombre"],
        },
      ],
    });
  }
  async findDogIdsByUser(duenioId: string): Promise<Perro[]> {
    const Perros = await Perro.findAll({
      where: { duenioId },
      attributes: ["id", "nombre"],
    });

    return Perros;
  }

  async findOneForAuth(ci: string): Promise<User | null> {
    return await User.findByPk(ci);
  }

  async findOneWithToken(token: string): Promise<User | null> {
    const JWT_SECRET = process.env.JWT_SECRET!;

    const payload = jwt.verify(token, JWT_SECRET) as unknown as PayloadForUser;
    return await User.findByPk(payload.ci);
  }

  async create(request: CreateUserDto): Promise<string> {
    const { password, ...rest } = request;
    if (typeof password !== "string") {
      throw new Error("Invalid password type: expected string");
    }
    if (!password || password.length < 8 || !/[A-Z]/.test(password)) {
      throw new Error("Password must be at least 8 characters long and contain at least one uppercase letter");
    }
    const hashed = await Hashing.hashPassword(password);
    const createUserDto: CreateUserDto = { ...rest, password: hashed };
    const transaction = await sequelize.transaction();

    const perros = normalizePerros(createUserDto.perros);
    try {
      const esAdmin = createUserDto.rol === "admin";
      const usr = await User.create(
        { ...createUserDto, esAdmin },
        { transaction }
      );
      await Promise.all(
        perros.map(async (perro) => {
          const p = await Perro.findOne({ where: { id: perro } });
          if (p) {
            await p.update({ duenioId: createUserDto.ci }, { transaction });
          }
        })
      );

      await transaction.commit();

      return usr.ci;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  async update(
    username: string,
    updateData: Partial<CreateUserDto>
  ): Promise<User | null> {
    const user = await User.findByPk(username);
    if (!user) return null;

    const dataToUpdate = { ...updateData };

    if (dataToUpdate.password) {
      
      if (typeof dataToUpdate.password !== "string") {
        console.error("Invalid password type:", typeof dataToUpdate.password);
        throw new Error("Invalid password type: expected string");
      }
      if (!dataToUpdate.password || dataToUpdate.password.length < 8 || !/[A-Z]/.test(dataToUpdate.password)) {
        throw new Error("Password must be at least 8 characters long and contain at least one uppercase letter");
      }
      dataToUpdate.password = await Hashing.hashPassword(dataToUpdate.password);
    }
    return await user.update(dataToUpdate);
  }

  async delete(ci: string): Promise<boolean> {
    const deleted = await User.destroy({
      where: { ci },
    });

    return deleted > 0;
  }
}
