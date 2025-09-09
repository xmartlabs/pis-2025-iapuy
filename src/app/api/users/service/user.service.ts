import { User } from "@/app/models/user.entity";
import { CreateUserDto } from "../dtos/create-user.dto";
import { Intervencion } from "../../../models/intervencion.entity";
import { PaginationDto } from "@/lib/pagination/pagination.dto";
import { PaginationResultDto } from "@/lib/pagination/pagination-result.dto";
import { getPaginationResultFromModel } from "@/lib/pagination/transform";
import { Hashing } from "@/lib/crypto/hash";
import { Op } from "sequelize";

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

  async create(createUserDto: CreateUserDto): Promise<User> {
    createUserDto.password = await Hashing.hashPassword(createUserDto.password);
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
