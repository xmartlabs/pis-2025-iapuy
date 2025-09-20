import { User } from "@/app/models/user.entity";
import { Perro } from "@/app/models/perro.entity";
import { CreateUserDto } from "../dtos/create-user.dto";
import { Intervencion } from "../../../models/intervencion.entity";
import { Perro } from "@/app/models/perro.entity";
import type { PaginationDto } from "@/lib/pagination/pagination.dto";
import type { PaginationResultDto } from "@/lib/pagination/pagination-result.dto";
import { getPaginationResultFromModel } from "@/lib/pagination/transform";
import { Hashing } from "@/lib/crypto/hash";
import { Op } from "sequelize";
import sequelize from "@/lib/database";

export class UserService {
  async findAll(pagination: PaginationDto): Promise<PaginationResultDto<User>> {
    const result = await User.findAndCountAll({
      where: pagination.query
        ? { nombre: { [Op.iLike]: `%${pagination.query}%` } }
        : undefined,
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
      order: pagination.getOrder(),
    });

    return getPaginationResultFromModel(pagination, result);
  }

  async findOne(username: string): Promise<User | null> {
    return await User.findByPk(username);
  }

  async create(createUserDto: CreateUserDto): Promise<String> {
    createUserDto.password = await Hashing.hashPassword(createUserDto.password);
    const transaction = await sequelize.transaction();
    
    try{
      const usr = await User.create({ ...createUserDto }, { transaction });
      const perros : Array<String> = createUserDto.perros;
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
    }
    catch (error){
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
    return await user.update(updateData);
  }

  async delete(username: string): Promise<boolean> {
    const deleted = await User.destroy({
      where: { username },
    });

    return deleted > 0;
  }
}
