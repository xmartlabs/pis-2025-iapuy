import { User } from "@/app/models/user.entity";
import type { CreateUserDto } from "../dtos/create-user.dto";
import { Intervencion } from "../../../models/intervencion.entity";
import { Perro } from "@/app/models/perro.entity";
import type { PaginationDto } from "@/lib/pagination/pagination.dto";
import type { PaginationResultDto } from "@/lib/pagination/pagination-result.dto";
import { getPaginationResultFromModel } from "@/lib/pagination/transform";
import { Op } from "sequelize";

export class UserService {
  async findAll(pagination: PaginationDto): Promise<PaginationResultDto<User>> {
    const result = await User.findAndCountAll({
      where: pagination.query
        ? { nombre: { [Op.iLike]: `%${pagination.query}%` } }
        : undefined,
      attributes: ["ci", "nombre", "celular", "banco", "cuentaBancaria"],
      include: [
        {
          model: Intervencion,
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

  async findOneForAuth(ci: string): Promise<User | null> {
    return await User.findByPk(ci);
  }

  async create(createUserDto: CreateUserDto): Promise<User> {
    return await User.create({ ...createUserDto });
  }

  async update(
    username: string,
    updateData: Partial<CreateUserDto>
  ): Promise<User | null> {
    const user = await User.findByPk(username);
    if (!user) return null;
    return await user.update(updateData);
  }

  async delete(username: string): Promise<boolean> {
    const deleted = await User.destroy({
      where: { username },
    });

    return deleted > 0;
  }
}
